from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn
import os

# --- Impor Layer 0 ---
from anti_obfuscation_detector import (
    evaluate_message, 
    DonationMetadata, 
    Decision,
    normalize_chars
)

# --- Impor Layer 1 (ONNX) ---
from transformers import AutoTokenizer
from optimum.onnxruntime import ORTModelForSequenceClassification
from optimum.pipelines import pipeline

# ---------------------------------------------------------------------------
# Konfigurasi Keamanan API
# ---------------------------------------------------------------------------
API_KEY_NAME = "X-API-Key"
API_KEY = os.getenv("API_KEY", "rahasia-komunitip-123") # Ganti di Production!
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Akses Ditolak. API Key Salah.")
    return api_key

from contextlib import asynccontextmanager

# Variabel Global untuk Model
nlp_pipeline = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Memuat model ONNX ke RAM hanya 1 KALI saat server menyala."""
    global nlp_pipeline
    model_path = "./models/indobert_onnx"
    
    print("[START] Sedang memuat Model ONNX IndoBERT ke RAM...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        # Menggunakan ORTModelForSequenceClassification untuk performa maksimal
        model = ORTModelForSequenceClassification.from_pretrained(model_path)
        
        # Membuat pipeline klasifikasi (mirip seperti di Kaggle)
        nlp_pipeline = pipeline("text-classification", model=model, tokenizer=tokenizer)
        print("[SUCCESS] Model ONNX siap beroperasi!")
    except Exception as e:
        print(f"[ERROR] Gagal memuat model ONNX. Pastikan folder {model_path} ada. Error: {e}")
        # Server tetap hidup (Fail-Closed) menggunakan Layer 0
    yield
    # Bersihkan memori saat server mati
    nlp_pipeline = None

# ---------------------------------------------------------------------------
# Inisialisasi Aplikasi & Model RAM (Memory Management)
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Anti-Judol Hybrid Microservice",
    description="Layer 0 (Regex) + Layer 1 (ONNX IndoBERT) API",
    version="1.0.0",
    lifespan=lifespan
)

# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------
class DonationMessageRequest(BaseModel):
    donation_id: str
    raw_text: str = Field(..., max_length=500)
    donor_messages_last_10min: int = 0
    amount: int = 0
    url_domain: Optional[str] = None
    is_round_amount: bool = False
    donor_account_age_minutes: Optional[int] = None

class DetectionResponse(BaseModel):
    donation_id: str
    decision: Decision
    risk_score: int
    matched_keywords: List[str]
    ai_confidence: Optional[float] = None
    execution_path: str

# ---------------------------------------------------------------------------
# Endpoint Utama
# ---------------------------------------------------------------------------
@app.post("/v1/evaluate", response_model=DetectionResponse)
def evaluate(req: DonationMessageRequest, api_key: str = Depends(verify_api_key)):
    global nlp_pipeline
    
    # 1. Bentuk objek Metadata
    meta = DonationMetadata(
        donor_messages_last_10min=req.donor_messages_last_10min,
        amount=req.amount,
        url_domain=req.url_domain,
        is_round_amount=req.is_round_amount,
        donor_account_age_minutes=req.donor_account_age_minutes,
    )
    
    # 2. EKSEKUSI TAHAP 0 (Regex & Anomali)
    layer0_result = evaluate_message(req.raw_text, meta)
    matched_kws = [m.keyword for m in layer0_result.rule_matches]
    
    # 3. CASCADE FLOW (Logika Keputusan Hibrida)
    # Jika Layer 0 sangat yakin Aman atau Berbahaya, jangan ganggu AI.
    if not layer0_result.needs_ml_review:
        return DetectionResponse(
            donation_id=req.donation_id,
            decision=layer0_result.decision,
            risk_score=layer0_result.rule_score,
            matched_keywords=matched_kws,
            execution_path="Layer-0-Only"
        )
    
    # 4. EKSEKUSI TAHAP 1 (AI ONNX IndoBERT)
    # Teks ini mencurigakan (HOLD). Panggil AI untuk kepastian absolut.
    if nlp_pipeline is None:
        # Jika AI gagal di-load saat startup, Fallback ke HOLD
        return DetectionResponse(
            donation_id=req.donation_id,
            decision=Decision.HOLD,
            risk_score=layer0_result.rule_score,
            matched_keywords=matched_kws,
            execution_path="Layer-0-Fallback"
        )
        
    try:
        # Prediksi teks (Catatan: teks kotor harus dibersihkan? Pipeline kita handle ini)
        cleaned_text = normalize_chars(req.raw_text)
        ai_result = nlp_pipeline(cleaned_text)[0]
        label = ai_result['label']
        score = ai_result['score']
        
        # Karena kita sudah update config.json, label akan berupa 'Normal' atau 'Judol'
        if label == 'Judol' or label == 'LABEL_1': # Judol
            final_decision = Decision.BLOCK
        else: # Normal
            final_decision = Decision.CLEAR
            
        return DetectionResponse(
            donation_id=req.donation_id,
            decision=final_decision,
            risk_score=int(score * 100),
            matched_keywords=matched_kws,
            ai_confidence=score,
            execution_path="Layer-1-AI"
        )
    except Exception as e:
        print(f"Error AI inference: {e}")
        return DetectionResponse(
            donation_id=req.donation_id,
            decision=Decision.HOLD,
            risk_score=100,
            matched_keywords=matched_kws,
            execution_path="Layer-1-Error"
        )

# Endpoint kesehatan untuk di-ping oleh Server NestJS
@app.get("/")
def health_check():
    return {"status": "ok", "ai_loaded": nlp_pipeline is not None}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
