from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import re
import ast
from rapidfuzz import fuzz, process
from sklearn.metrics import confusion_matrix

app = FastAPI(title="Unified Fraud & Abuse Detector API", version="1.2")

# --- DATA PATHS ---
DF_SCORING_PATH = r"C:\Users\thapa\Desktop\project\df_scoring.csv"  
SUB_PATH        = r"C:\Users\thapa\Desktop\project\sub.csv"         
MASTER_CSV_PATH = r"C:\Users\thapa\Desktop\project\Online retial II\MERGED MASTER NOTEBOOK\merged_master_firewall_output.csv"
COMPANY_CSV_PATH = r"C:\Users\thapa\Desktop\project\Online retial II\company names\Company Names.csv"

# --- LOAD DATA ---
try:
    df_scoring = pd.read_csv(DF_SCORING_PATH)
    sub = pd.read_csv(SUB_PATH)
    master_df = pd.read_csv(MASTER_CSV_PATH)
    companies_df = pd.read_csv(COMPANY_CSV_PATH)
    
    # Enforce types for Banksim Data
    df_scoring["fraud"] = df_scoring["fraud"].fillna(0).astype(int)
    
    # Normalize Retail II Data
    master_df["merchant_id"] = master_df["merchant_id"].astype(str).str.strip()
    
    # Init company list for fuzzy matching
    companies_df.columns = [c.strip().lower() for c in companies_df.columns]
    name_col = next((c for c in ["name", "company", "company_name", "business_name"] if c in companies_df.columns), companies_df.columns[0])
    companies_df = companies_df.dropna(subset=[name_col])
    company_list = companies_df[name_col].astype(str).apply(lambda x: re.sub(r"[^a-z0-9\s]", " ", x.lower()).strip()).unique().tolist()
    
    # Fast lookup for Retail II
    merchant_lookup = master_df.set_index("merchant_id").to_dict(orient="index")
    print(f"Loaded {len(master_df)} master merchants and {len(company_list)} company names.")
except Exception as e:
    print(f"Error loading datasets: {e}")

# --- SCHEMAS ---
class TransactionRequest(BaseModel):
    merchant_id: str | None = None
    merchant_name: str | None = None
    customer_id: str | None = None
    amount: float | None = None
    currency: str | None = "USD"
    timestamp: str | None = None

# --- HELPERS ---
def normalize_name(x: str) -> str:
    x = str(x).lower()
    x = re.sub(r"[^a-z0-9\s]", " ", x)
    x = re.sub(r"\s+", " ", x).strip()
    stop = {"pvt", "private", "ltd", "limited", "inc", "co", "official", "store", "online", "services"}
    return " ".join([t for t in x.split() if t not in stop]).strip()

def safe_parse_patterns(x):
    if x is None or (isinstance(x, float) and pd.isna(x)): return []
    if isinstance(x, list): return x
    try:
        v = ast.literal_eval(str(x))
        if isinstance(v, list): return [str(i) for i in v]
    except: pass
    return [p.strip() for p in str(x).split(",") if p.strip()]

def compute_metrics(sub_eval: pd.DataFrame):
    y_true, y_pred = sub_eval["fraud"].values, sub_eval["pred"].values
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    fpr = fp / (fp + tn + 1e-9)
    recall = tp / (tp + fn + 1e-9)
    precision = tp / (tp + fp + 1e-9)
    return {"precision": float(precision), "recall": float(recall), "fpr": float(fpr), "confusion": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)}}

def guidance_from_decision(decision: str):
    if decision == "ALLOW": return "Payment looks safe."
    if decision == "REVIEW": return "Suspicious. Recommended: step-up authentication (OTP)."
    return "High risk. Recommended: BLOCK transaction."

# --- ENDPOINTS ---
@app.get("/")
def home():
    return {
        "message": "Unified API Running",
        "endpoints": ["/evaluate-subscriptions", "/score-transaction", "/merchant/{merchant_id}"]
    }

@app.get("/evaluate-subscriptions")
def evaluate_subscriptions(tune_fpr: bool = False, fpr_target: float = 0.01):
    sub_true = df_scoring.groupby("subscription_id")["fraud"].max().reset_index()
    sub_eval = sub.merge(sub_true, on="subscription_id", how="left").fillna(0)
    
    if not tune_fpr:
        sub_eval["pred"] = sub_eval["decision"].isin(["REVIEW", "BLOCK"]).astype(int)
        return {"mode": "decision_based", "metrics": compute_metrics(sub_eval)}
    
    # Simple tuning logic here (shortened for brevity but fully functional)
    thresholds = np.linspace(0.0, 1.0, 101)
    best = None
    for t in thresholds:
        y_pred = (sub_eval["max_fraud_prob"] >= t).astype(int)
        tn, fp, fn, tp = confusion_matrix(sub_eval["fraud"], y_pred, labels=[0, 1]).ravel()
        fpr = fp / (fp + tn + 1e-9)
        if fpr <= fpr_target:
            recall = tp / (tp + fn + 1e-9)
            if best is None or recall > best["recall"]:
                best = {"threshold": t, "recall": recall, "fpr": fpr}
    
    return {"mode": "tuned_threshold", "best": best}

@app.post("/score-transaction")
def score_transaction(req: TransactionRequest):
    m_id = (req.merchant_id or "").strip()
    m_name = req.merchant_name or ""
    
    base = merchant_lookup.get(m_id)
    if base:
        decision = base.get("final_decision", "REVIEW")
        return {
            "merchant_id": m_id,
            "decision": decision,
            "trust_score": float(base.get("merchant_trust_score", 50)),
            "patterns": safe_parse_patterns(base.get("patterns_detected", [])),
            "guidance": guidance_from_decision(decision)
        }

    # Fallback fuzzy matching
    q = normalize_name(m_name)
    best_match, score = ("", 0)
    if q and company_list:
        match = process.extractOne(q, company_list, scorer=fuzz.token_sort_ratio)
        if match: best_match, score = match[0], int(match[1])
    
    decision = "BLOCK" if score >= 90 else "REVIEW"
    return {
        "merchant_id": m_id,
        "decision": decision,
        "fuzzy_match": best_match,
        "match_score": score,
        "guidance": guidance_from_decision(decision)
    }

@app.get("/merchant/{merchant_id}")
def get_merchant(merchant_id: str):
    m = merchant_lookup.get(merchant_id.strip())
    return {"merchant_id": merchant_id, "found": bool(m), "profile": m}



# Invoke-RestMethod -Uri "http://127.0.0.1:8000/score-transaction" `
# -Method Post `
# -ContentType "application/json" `
# -Body '{"merchant_id":"united kingdom_85123a","merchant_name":"Netflix Official","amount":12.99}'
