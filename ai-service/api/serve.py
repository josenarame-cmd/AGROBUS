"""
AGROBUS — AI Soil Analysis Service
FastAPI REST Endpoint (Sprint 2 — Future Integration)
===========================================================
This module provides the HTTP interface that Spring Boot will later call
via an internal service-to-service request.

NOT needed for the first soil-classification prototype.
Run this only when you want to test the API layer independently:

    uvicorn api.serve:app --reload --port 8001

Then POST a soil image:
    curl -X POST http://localhost:8001/api/v1/soil/predict \\
         -F "file=@my_soil_photo.jpg"
"""

import io
import json
import sys
from datetime import datetime
from pathlib import Path

# FastAPI is an optional dependency — guard import
try:
    from fastapi import FastAPI, File, UploadFile, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    _FASTAPI_AVAILABLE = True
except ImportError:
    _FASTAPI_AVAILABLE = False

if not _FASTAPI_AVAILABLE:
    print(
        "[ERROR] FastAPI is not installed. "
        "Run:  pip install fastapi uvicorn[standard] python-multipart"
    )
    sys.exit(1)

sys.path.insert(0, str(Path(__file__).parent.parent))

import torch
from PIL import Image

from config import MODEL_PATH, CONFIDENT_THRESHOLD, REVIEW_THRESHOLD
from utils.data_utils import get_eval_transform
from training.model import load_model

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="AGROBUS — AI Soil Analysis API",
    description=(
        "Prototype endpoint for soil image classification. "
        "Results are AI-assisted estimates, NOT certified laboratory results. "
        "Human/agronomist review is recommended for confidence below 75%."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Model caching ─────────────────────────────────────────────────────────────

_model_cache: dict = {}


def get_model():
    if "model" not in _model_cache:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        if not MODEL_PATH.exists():
            raise RuntimeError(
                "Model not found. Run  python training/train.py  first."
            )
        model, class_names = load_model(MODEL_PATH, device)
        _model_cache["model"]       = model
        _model_cache["class_names"] = class_names
        _model_cache["device"]      = device
    return _model_cache["model"], _model_cache["class_names"], _model_cache["device"]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "AGROBUS AI Soil Analysis",
        "timestamp": datetime.now().isoformat(),
        "model_ready": MODEL_PATH.exists(),
    }


@app.post("/api/v1/soil/predict")
async def predict_soil(file: UploadFile = File(...)):
    """
    Classify an uploaded soil image.

    Returns:
      - soil_type: predicted soil category
      - confidence_pct: 0–100 float
      - review_required: boolean
      - top_predictions: ranked list
      - disclaimer: prototype warning
    """
    # Validate file type
    if file.content_type not in ("image/jpeg", "image/png", "image/webp", "image/bmp"):
        raise HTTPException(
            status_code=415,
            detail="Unsupported media type. Please upload a JPEG, PNG, WebP, or BMP image.",
        )

    # Read image bytes
    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot read image: {e}")

    # Get model
    try:
        model, class_names, device = get_model()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # Preprocess
    transform = get_eval_transform()
    tensor = transform(img).unsqueeze(0).to(device)

    # Inference
    model.eval()
    with torch.no_grad():
        logits = model(tensor)
        probs  = torch.softmax(logits, dim=1).squeeze().cpu().numpy()

    top_idxs = probs.argsort()[::-1]
    best_idx  = int(top_idxs[0])
    best_prob = float(probs[best_idx])
    confidence = round(best_prob * 100, 1)

    review_required = best_prob < CONFIDENT_THRESHOLD
    review_reason = None
    if review_required:
        if best_prob < REVIEW_THRESHOLD:
            review_reason = (
                f"Very low confidence ({confidence}%). Image quality or soil type "
                "is outside the training distribution. Laboratory analysis recommended."
            )
        else:
            review_reason = (
                f"Confidence ({confidence}%) is below 75%. "
                "Agronomist validation recommended before field decisions."
            )

    return JSONResponse({
        "timestamp": datetime.now().isoformat(),
        "filename": file.filename,
        "prediction": {
            "soil_type": class_names[best_idx],
            "confidence_pct": confidence,
            "confidence_raw": round(best_prob, 6),
            "review_required": review_required,
            "review_reason": review_reason,
        },
        "top_predictions": [
            {"soil_type": class_names[i], "confidence_pct": round(float(probs[i]) * 100, 1)}
            for i in top_idxs[:3]
        ],
        "disclaimer": (
            "PROTOTYPE — AI-assisted soil classification for preliminary screening only. "
            "This result is NOT equivalent to a certified laboratory soil test. "
            "Agronomist validation is required before applying crop or fertiliser recommendations."
        ),
    })
