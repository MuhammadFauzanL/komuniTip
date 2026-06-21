from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn
import os
import json
import numpy as np
import onnxruntime as ort

# --- Impor Layer 0 ---
from anti_obfuscation_detector import (
    evaluate_message, 
    DonationMetadata, 
    Decision,
    normalize_chars
)

# --- Impor Layer 1 (ONNX) ---
from transformers import AutoTokenizer

# ---------------------------------------------------------------------------
# Konfigurasi Keamanan API
# ---------------------------------------------------------------------------
API_KEY_NAME = "X-API-Key"
API_KEY = os.getenv("API_KEY", "rahasia-komunitip-123") # Ganti di Production!
MODEL_PATH = os.getenv("MODEL_PATH", "./risk-engine")
PORT = int(os.getenv("PORT", "8000"))
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Akses Ditolak. API Key Salah.")
    return api_key

from contextlib import asynccontextmanager

# Variabel Global untuk Model
tokenizer = None
onnx_session = None
id2label = {}

def softmax(logits: np.ndarray) -> np.ndarray:
    shifted = logits - np.max(logits, axis=-1, keepdims=True)
    exp = np.exp(shifted)
    return exp / np.sum(exp, axis=-1, keepdims=True)

def run_onnx_classification(text: str) -> dict:
    if tokenizer is None or onnx_session is None:
        raise RuntimeError("Model ONNX belum siap.")

    encoded = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=128,
        return_tensors="np",
    )

    input_names = {input_meta.name for input_meta in onnx_session.get_inputs()}
    model_inputs = {
        name: value.astype(np.int64)
        for name, value in encoded.items()
        if name in input_names
    }

    logits = onnx_session.run(None, model_inputs)[0]
    probabilities = softmax(logits)[0]
    predicted_id = int(np.argmax(probabilities))

    return {
        "label": id2label.get(str(predicted_id), f"LABEL_{predicted_id}"),
        "score": float(probabilities[predicted_id]),
    }

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Memuat model ONNX ke RAM hanya 1 KALI saat server menyala."""
    global tokenizer, onnx_session, id2label
    
    print("[START] Sedang memuat Model ONNX IndoBERT ke RAM...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

        with open(os.path.join(MODEL_PATH, "config.json"), "r", encoding="utf-8") as config_file:
            model_config = json.load(config_file)
            id2label = model_config.get("id2label", {})

        onnx_session = ort.InferenceSession(
            os.path.join(MODEL_PATH, "model_quantized.onnx"),
            providers=["CPUExecutionProvider"],
        )
        print("[SUCCESS] Model ONNX siap beroperasi!")
    except Exception as e:
        print(f"[ERROR] Gagal memuat model ONNX. Pastikan folder {MODEL_PATH} ada. Error: {e}")
        # Server tetap hidup (Fail-Closed) menggunakan Layer 0
    yield
    # Bersihkan memori saat server mati
    tokenizer = None
    onnx_session = None

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
    combined_risk_score = min(
        layer0_result.rule_score + layer0_result.metadata_score,
        100
    )
    
    # 3. CASCADE FLOW (Logika Keputusan Hibrida)
    # Jika Layer 0 sangat yakin Aman atau Berbahaya, jangan ganggu AI.
    if not layer0_result.needs_ml_review:
        return DetectionResponse(
            donation_id=req.donation_id,
            decision=layer0_result.decision,
            risk_score=combined_risk_score,
            matched_keywords=matched_kws,
            execution_path="Layer-0-Only"
        )
    
    # 4. EKSEKUSI TAHAP 1 (AI ONNX IndoBERT)
    # Teks ini mencurigakan (HOLD). Panggil AI untuk kepastian absolut.
    if tokenizer is None or onnx_session is None:
        # Jika AI gagal di-load saat startup, Fallback ke HOLD
        return DetectionResponse(
            donation_id=req.donation_id,
            decision=Decision.HOLD,
            risk_score=combined_risk_score,
            matched_keywords=matched_kws,
            execution_path="Layer-0-Fallback"
        )
        
    try:
        # Prediksi teks (Catatan: teks kotor harus dibersihkan? Pipeline kita handle ini)
        cleaned_text = normalize_chars(req.raw_text)
        ai_result = run_onnx_classification(cleaned_text)
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
    return {"status": "ok", "ai_loaded": tokenizer is not None and onnx_session is not None}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
