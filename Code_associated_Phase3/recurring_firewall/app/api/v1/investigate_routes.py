from fastapi import APIRouter, Depends, HTTPException
from ...models.dtos import InvestigateRequestDTO, InvestigateResponseDTO
from ...services.rag_service import RAGService
from ...services.gemini_service import GeminiService
from ..dependencies import get_rag_service, get_gemini_service
import json
import re

router = APIRouter()

def build_gemini_prompt(payload: dict, rag: dict):
    return f"""
You are an expert Fraud Analyst Assistant in a bank for "Recurring Payment Firewall".

STRICT:
- Only use payload + RAG evidence.
- If unknown say "insufficient evidence".
- Output must be VALID JSON only (no markdown).

PAYLOAD:
{payload}

RAG:
{rag}

OUTPUT JSON:
{{
  "risk_summary": "2 lines max",
  "key_reasons": ["...", "..."],
  "recommended_bank_action": ["..."],
  "customer_guidance": ["..."],
  "cancellation_instructions": ["Step 1...", "Step 2..."],
  "confidence": "LOW/MEDIUM/HIGH"
}}
""".strip()

def safe_parse_gemini_json(text: str):
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```[a-zA-Z]*", "", t).strip()
        if t.endswith("```"):
            t = t[:-3].strip()
    try:
        return json.loads(t)
    except Exception:
        return {"raw_text": text, "error": "LLM output not valid JSON"}

@router.post("/investigate-transaction", response_model=InvestigateResponseDTO)
async def investigate_transaction(
    req: InvestigateRequestDTO,
    rag_service: RAGService = Depends(get_rag_service),
    gemini_service: GeminiService = Depends(get_gemini_service)
):
    merchant_id = (req.merchant_id or "UNKNOWN").strip()
    merchant_name = (req.merchant_name or "UNKNOWN").strip()

    # 1. Build Context
    rag = await rag_service.build_context(merchant_id, merchant_name)
    
    # 2. Construct Prompt
    prompt = build_gemini_prompt(req.model_dump(), rag)

    # 3. Call LLM
    try:
        output_text = await gemini_service.generate(prompt)
        parsed = safe_parse_gemini_json(output_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Error: {str(e)}")

    return {
        "ok": True, 
        "merchant_id": merchant_id, 
        "merchant_name": merchant_name, 
        "investigation": parsed
    }
