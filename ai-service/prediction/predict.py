"""
AGROBUS — AI Soil Analysis Service
Prediction Script
===========================================================
Usage:
    python prediction/predict.py <path-to-image>
    python prediction/predict.py <path-to-image> [--model-path <path>] [--top-k 3]

Example:
    python prediction/predict.py sample_soil.jpg
    python prediction/predict.py my_field_photo.png --top-k 4

Output (printed to stdout + saved as JSON):
    ┌──────────────────────────────────────────────┐
    │  AGROBUS Soil Analysis — Prediction Result   │
    ├──────────────────────────────────────────────┤
    │  Soil Type   :  Loamy / Clay Soil            │
    │  Confidence  :  82 %                         │
    │  Review Flag :  Not required                 │
    └──────────────────────────────────────────────┘

IMPORTANT DISCLAIMER:
  This prediction is produced by a prototype machine-learning model and
  is intended as an initial screening aid only.
  It must NOT be treated as a certified soil laboratory result.
  A confidence below 75 % triggers an automatic recommendation for
  human/agronomist review before any field decisions are made.
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import torch
import torch.nn.functional as F

from config import MODEL_PATH, HIGH_CONFIDENCE, MEDIUM_CONFIDENCE
from utils.data_utils import load_single_image
from training.model import load_model


# ── Prediction ────────────────────────────────────────────────────────────────

def assess_confidence(best_prob: float) -> dict:
    """"Assess confidence and return structured flags & reasons."""
    from config import HIGH_CONFIDENCE, MEDIUM_CONFIDENCE

    if best_prob >= HIGH_CONFIDENCE:
        return {
            "confidence_level": "HIGH",
            "review_required": False,
            "review_status": "NOT_REQUIRED",
            "review_reason": None,
            "review_flag_label": "NOT REQUIRED",
        }
    elif best_prob >= MEDIUM_CONFIDENCE:
        return {
            "confidence_level": "MEDIUM",
            "review_required": True,
            "review_status": "PENDING",
            "review_reason": (
                "The model prediction has medium confidence.\n"
                "Consider human/agronomist verification."
            ),
            "review_flag_label": "RECOMMENDED",
        }
    else:
        return {
            "confidence_level": "LOW",
            "review_required": True,
            "review_status": "PENDING",
            "review_reason": (
                "The model is uncertain about this image.\n"
                "Consider retaking the photo under better lighting\n"
                "or submitting the sample for expert/laboratory review."
            ),
            "review_flag_label": "REQUIRED",
        }

def predict(
    image_path: Path,
    model_path: Path = MODEL_PATH,
    top_k: int = 3,
    save_json: bool = True,
) -> dict:
    """
    Classify a soil image and return a prediction dict with confidence score.

    Returns:
    Returns:
        {
          "image_path": str,
          "soil_type": str,
          "confidence": float,
          "confidence_level": str,
          "review_required": bool,
          "review_status": str,
          "review_reason": str | None,
          "review_flag_label": str,
          "top_k_predictions": [ ... ],
          "timestamp": str,
          "disclaimer": str
        }
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    if not model_path.exists():
        print(f"[ERROR] Model checkpoint not found: {model_path}")
        print("Please train the model first:  python training/train.py")
        sys.exit(1)

    if not image_path.exists():
        print(f"[ERROR] Image not found: {image_path}")
        sys.exit(1)

    # Load model
    model, class_names = load_model(model_path, device)
    model.eval()

    # Load + preprocess image
    tensor = load_single_image(image_path).to(device)

    # Inference
    with torch.no_grad():
        logits = model(tensor)
        probs  = F.softmax(logits, dim=1).squeeze()   # shape [num_classes]

    probs_np = probs.cpu().numpy()
    top_k    = min(top_k, len(class_names))
    top_idxs = probs_np.argsort()[::-1][:top_k]

    best_idx    = int(top_idxs[0])
    best_prob   = float(probs_np[best_idx])
    best_class  = class_names[best_idx]
    confidence  = round(best_prob * 100, 1)

    # Decide review flag
    assessment = assess_confidence(best_prob)
    confidence_level = assessment["confidence_level"]
    review_required = assessment["review_required"]
    review_status = assessment["review_status"]
    review_reason = assessment["review_reason"]
    review_flag_label = assessment["review_flag_label"]

    top_k_list = [
        {
            "soil_type": class_names[i],
            "confidence": round(float(probs_np[i]), 3),
            "confidence_pct": round(float(probs_np[i]) * 100, 1)
        }
        for i in top_idxs
    ]

    result = {
        "image_path": str(image_path),
        "soil_type": best_class,
        "confidence": round(best_prob, 4),
        "confidence_level": confidence_level,
        "review_required": review_required,
        "review_status": review_status,
        "review_reason": review_reason,
        "review_flag_label": review_flag_label,
        "top_k_predictions": top_k_list,
        "timestamp": datetime.now().isoformat(),
        "disclaimer": "Prototype model — not a laboratory soil test."
    }

    if save_json:
        # Prepare structured review data storage
        ai_service_root = Path(__file__).parent.parent
        review_dir = ai_service_root / "data" / "reviews"
        review_dir.mkdir(parents=True, exist_ok=True)
        review_path = review_dir / "prediction_reviews.json"

        reviews = []
        if review_path.exists():
            try:
                with open(review_path, "r", encoding="utf-8") as f:
                    reviews = json.load(f)
            except Exception:
                pass

        review_entry = {
            "image_path": str(image_path),
            "predicted_soil_type": best_class,
            "confidence": round(best_prob, 4),
            "confidence_level": confidence_level,
            "review_required": review_required,
            "review_status": review_status,
            "reviewer_result": None,
            "reviewer_notes": None,
            "timestamp": result["timestamp"]
        }
        reviews.append(review_entry)
        with open(review_path, "w", encoding="utf-8") as f:
            json.dump(reviews, f, indent=2)

    return result


# ── CLI display ───────────────────────────────────────────────────────────────

def print_result(result: dict) -> None:
    topk = result["top_k_predictions"]

    print()
    print("┌" + "─" * 52 + "┐")
    print("│   AGROBUS Soil Analysis — Prediction Result       │")
    print("├" + "─" * 52 + "┤")
    print(f"│  Image       : {result['image_path'][-35:]:>35s}   │")
    print(f"│  Timestamp   : {result['timestamp'][:19]:<35s}   │")
    print("├" + "─" * 52 + "┤")
    print(f"│  Soil Type   : {result['soil_type']:<35s}   │")
    print(f"│  Confidence  : {result['confidence'] * 100:>5.1f} %                               │")
    print(f"│  Conf Level  : {result['confidence_level']:<35s}   │")
    print(f"│  Review Flag : {result['review_flag_label']:<35s}   │")
    print("├" + "─" * 52 + "┤")
    print("│  Top-K Predictions:                                │")
    for i, item in enumerate(topk, 1):
        line = f"│    {i}. {item['soil_type']:<25s}  {item['confidence_pct']:>5.1f} %   │"
        print(line)
    print("├" + "─" * 52 + "┤")
    if result["review_reason"]:
        # split manually on newlines
        lines_txt = result["review_reason"].split("\n")
        print("│  Review Reason:                                    │")
        for l in lines_txt:
            print(f"│    {l:<48s}│")
        print("├" + "─" * 52 + "┤")
    print("│  DISCLAIMER: Prototype model — not a lab result.  │")
    print("└" + "─" * 52 + "┘")
    print()


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Classify a soil image with the AGROBUS AI model.")
    parser.add_argument("image", type=Path, help="Path to soil image file (.jpg, .png, …)")
    parser.add_argument("--model-path", type=Path, default=MODEL_PATH, help="Path to model checkpoint")
    parser.add_argument("--top-k", type=int, default=3, help="Number of top predictions to display")
    parser.add_argument("--no-json", action="store_true", help="Do not save JSON output")
    args = parser.parse_args()

    result = predict(
        image_path=args.image,
        model_path=args.model_path,
        top_k=args.top_k,
        save_json=not args.no_json,
    )

    print_result(result)

    if not args.no_json:
        out_path = Path("prediction_result.json")
        with open(out_path, "w") as f:
            json.dump(result, f, indent=2)
        print(f"  Full result saved → {out_path}")
