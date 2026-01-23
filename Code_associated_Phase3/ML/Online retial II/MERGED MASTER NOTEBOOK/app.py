# uvicorn app:app --reload --port 8000


from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import re
import ast
from rapidfuzz import fuzz, process

app = FastAPI(title="Recurring Payment Firewall API", version="1.1")


def normalize_name(x: str) -> str:
    x = str(x).lower()
    x = re.sub(r"[^a-z0-9\s]", " ", x)
    x = re.sub(r"\s+", " ", x).strip()

    stop = {
        "pvt", "private", "ltd", "limited", "llp", "inc", "co", "company", "corp",
        "official", "store", "shop", "online", "services", "service", "solutions",
        "technology", "technologies", "international", "group", "payments", "pay"
    }
    tokens = [t for t in x.split() if t not in stop]
    return " ".join(tokens).strip()


def safe_parse_patterns(x):
    """
    Your CSV may store patterns_detected as:
    - list: ["A","B"]
    - string: "['A','B']"
    - string: "A,B"
    - NaN
    """
    if x is None or (isinstance(x, float) and pd.isna(x)):
        return []
    if isinstance(x, list):
        return x
    x = str(x).strip()

    # try parsing python-list string
    try:
        v = ast.literal_eval(x)
        if isinstance(v, list):
            return [str(i) for i in v]
    except Exception:
        pass

    # split fallback
    if "," in x:
        return [p.strip() for p in x.split(",") if p.strip()]

    # single token
    return [x] if x else []


# ----------------------------
# Load Master CSV (Merchant Profiles)
# ----------------------------
MASTER_CSV_PATH = r"C:\Users\thapa\Desktop\project\Online retial II\MERGED MASTER NOTEBOOK\merged_master_firewall_output.csv"
master_df = pd.read_csv(MASTER_CSV_PATH)

# Normalize merchant_id for safe lookups
master_df["merchant_id"] = master_df["merchant_id"].astype(str).str.strip()

# Parse patterns_detected safely
if "patterns_detected" in master_df.columns:
    master_df["patterns_detected"] = master_df["patterns_detected"].apply(safe_parse_patterns)

# Build fast lookup map
merchant_lookup = master_df.set_index("merchant_id").to_dict(orient="index")


# ----------------------------
# Load Company Names dataset (TRUE rename detection source)
# ----------------------------
COMPANY_CSV_PATH = r"C:\Users\thapa\Desktop\project\Online retial II\company names\Company Names.csv"
companies_df = pd.read_csv(COMPANY_CSV_PATH)

companies_df.columns = [c.strip().lower() for c in companies_df.columns]

possible_name_cols = ["name", "company", "company_name", "business_name", "organization", "organisation"]
name_col = None
for c in possible_name_cols:
    if c in companies_df.columns:
        name_col = c
        break

if name_col is None:
    name_col = companies_df.columns[0]  # fallback

companies_df = companies_df.dropna(subset=[name_col])
companies_df[name_col] = companies_df[name_col].astype(str)

companies_df["clean_name"] = companies_df[name_col].apply(normalize_name)
company_list = companies_df["clean_name"].dropna().unique().tolist()

print(f"[INIT] Loaded master merchants: {len(master_df)}")
print(f"[INIT] Loaded company names: {len(company_list)} (from column: {name_col})")


# ----------------------------
# Rename similarity scorer
# ----------------------------
def rename_similarity_score(merchant_name: str):
    """
    Returns (best_match, score)
    Uses company_names.csv list for matching
    """
    q = normalize_name(merchant_name)
    if not q or len(q) < 3 or len(company_list) == 0:
        return "", 0

    best = process.extractOne(q, company_list, scorer=fuzz.token_sort_ratio)
    if best is None:
        return "", 0
    return best[0], int(best[1])


def guidance_from_decision(decision: str):
    if decision == "ALLOW":
        return "Payment looks safe. Subscription can proceed."
    if decision == "REVIEW":
        return (
            "This subscription looks suspicious. Recommended: step-up authentication (OTP), "
            "or show warning + allow one-click cancellation."
        )
    return (
        "High risk recurring payment. Recommended: BLOCK transaction, alert user, "
        "and provide cancellation steps via bank app → Recurring Payments → Disable Merchant."
    )


def build_reasons(row: dict):
    reasons = []

    trust = row.get("merchant_trust_score", None)
    if trust is not None:
        try:
            trust = float(trust)
            if trust < 55:
                reasons.append(f"Low merchant trust score: {trust:.1f}/100")
        except:
            pass

    patterns = row.get("patterns_detected", [])
    patterns = safe_parse_patterns(patterns)
    if len(patterns) > 0:
        reasons.append("Patterns detected: " + ", ".join(patterns))

    rename = row.get("rename_similarity_score", None)
    if rename is not None:
        try:
            rename = int(rename)
            if rename >= 80:
                reasons.append(f"Merchant name similar to known companies (rename similarity: {rename})")
        except:
            pass

    micro = row.get("microcharge_rate", None)
    if micro is not None and micro != "":
        try:
            micro = float(micro)
            if micro > 0.5:
                reasons.append(f"High microcharge rate: {micro:.2f}")
        except:
            pass

    spike = row.get("spike_ratio", None)
    if spike is not None and spike != "":
        try:
            spike = float(spike)
            if spike > 5:
                reasons.append(f"Abnormal transaction spike ratio: {spike:.2f}")
        except:
            pass

    anomaly = row.get("anomaly_score", None)
    if anomaly is not None and anomaly != "":
        try:
            anomaly = float(anomaly)
            if anomaly > 0.75:
                reasons.append(f"Merchant anomaly score high: {anomaly:.2f}")
        except:
            pass

    if len(reasons) == 0:
        reasons.append("No high-risk signals detected.")

    return reasons[:5]


# ----------------------------
# Request Schema
# ----------------------------
class TransactionRequest(BaseModel):
    merchant_id: str | None = None
    merchant_name: str | None = None
    customer_id: str | None = None
    amount: float | None = None
    currency: str | None = "USD"
    timestamp: str | None = None


# ----------------------------
# API endpoints
# ----------------------------
@app.get("/")
def home():
    return {
        "message": "Recurring Payment Firewall API is running",
        "version": "1.1",
        "endpoints": ["/score-transaction", "/merchant/{merchant_id}"]
    }


@app.get("/merchant/{merchant_id}")
def merchant_profile(merchant_id: str):
    merchant_id = str(merchant_id).strip()
    m = merchant_lookup.get(merchant_id)
    if not m:
        return {"merchant_id": merchant_id, "found": False}
    return {"merchant_id": merchant_id, "found": True, "profile": m}


@app.post("/score-transaction")
def score_transaction(req: TransactionRequest):
    """
    Real-time scoring endpoint.
    Inference:
      - If merchant_id exists in master table -> direct lookup (super fast)
      - Else -> rename similarity detection using company_names.csv
    """
    merchant_id = (req.merchant_id or "").strip()
    merchant_name = req.merchant_name or ""

    # 1) Known merchant from offline scoring
    base = merchant_lookup.get(merchant_id)
    if base:
        decision = base.get("final_decision", "REVIEW")

        response = {
            "merchant_id": merchant_id,
            "merchant_name": base.get("merchant_name", merchant_name),
            "decision": decision,
            "merchant_trust_score": float(base.get("merchant_trust_score", 50)),
            "risk_score": float(base.get("risk_score", 0.5)),
            "rename_similarity_score": int(base.get("rename_similarity_score", 0)),
            "closest_company_match": base.get("closest_company_match", ""),
            "patterns_detected": safe_parse_patterns(base.get("patterns_detected", [])),
            "reasons": build_reasons(base),
            "user_guidance": guidance_from_decision(decision),
        }
        return response

    # 2) Unknown merchant -> rename-based fallback scoring
    best_match, rename_score = rename_similarity_score(merchant_name)

    # Conservative default trust score for unknown merchant
    trust_score = 50
    decision = "REVIEW"

    # Decision thresholds tuned for hackathon demo
    if rename_score >= 90:
        decision = "BLOCK"
        trust_score = 25
    elif rename_score >= 80:
        decision = "REVIEW"
        trust_score = 40
    else:
        decision = "REVIEW"
        trust_score = 50

    fallback_row = {
        "merchant_trust_score": trust_score,
        "rename_similarity_score": rename_score,
        "closest_company_match": best_match,
        "patterns_detected": ["NEW_MERCHANT"] + (["MERCHANT_REBRAND_PATTERN"] if rename_score >= 80 else []),
        "microcharge_rate": None,
        "spike_ratio": None,
        "anomaly_score": None
    }

    return {
        "merchant_id": merchant_id,
        "merchant_name": merchant_name,
        "decision": decision,
        "merchant_trust_score": float(trust_score),
        "risk_score": None,
        "rename_similarity_score": int(rename_score),
        "closest_company_match": best_match,
        "patterns_detected": fallback_row["patterns_detected"],
        "reasons": build_reasons(fallback_row),
        "user_guidance": guidance_from_decision(decision),
    }
