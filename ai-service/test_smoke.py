"""
AGROBUS -- AI Soil Analysis Service
Quick Smoke Test
===========================================================
Verifies the module can be imported and that a random tensor
passes through the model without errors -- no dataset required.

Usage:
    python test_smoke.py

Expected output (example):
    [OK]  Config imported OK
    [OK]  build_model() OK -- output shape: torch.Size([1, 4])
    [OK]  Softmax probabilities sum: 1.000
    [OK]  Top class index: 2  (valid)
    All smoke tests passed.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import torch

print("Running AGROBUS AI Service smoke tests ...\n")

# Test 1: config
try:
    from config import CLASS_NAMES, NUM_CLASSES, MODEL_ARCH, CONFIDENT_THRESHOLD
    assert NUM_CLASSES == len(CLASS_NAMES)
    print(f"[OK]  Config imported OK -- {NUM_CLASSES} classes: {CLASS_NAMES}")
except Exception as e:
    print(f"[FAIL]  Config import failed: {e}")
    sys.exit(1)

# Test 2: model
try:
    from training.model import build_model
    model = build_model(num_classes=NUM_CLASSES, pretrained=False)
    model.eval()
    x = torch.randn(1, 3, 224, 224)
    with torch.no_grad():
        out = model(x)
    assert out.shape == (1, NUM_CLASSES), f"Expected (1,{NUM_CLASSES}), got {out.shape}"
    print(f"[OK]  build_model() OK -- output shape: {out.shape}")
except Exception as e:
    print(f"[FAIL]  Model build/forward failed: {e}")
    sys.exit(1)

# Test 3: softmax probabilities
try:
    probs = torch.softmax(out, dim=1).squeeze()
    total = probs.sum().item()
    assert abs(total - 1.0) < 1e-5, f"Probabilities do not sum to 1: {total}"
    print(f"[OK]  Softmax probabilities sum: {total:.3f}")
except Exception as e:
    print(f"[FAIL]  Softmax check failed: {e}")
    sys.exit(1)

# Test 4: prediction index validity
try:
    top_idx = int(probs.argmax())
    assert 0 <= top_idx < NUM_CLASSES
    confidence = float(probs[top_idx]) * 100
    print(f"[OK]  Top class index: {top_idx} --> {CLASS_NAMES[top_idx]}  ({confidence:.1f} %)")
except Exception as e:
    print(f"[FAIL]  Prediction validity check failed: {e}")
    sys.exit(1)

# Test 5: data transforms
try:
    from utils.data_utils import get_eval_transform
    transform = get_eval_transform()
    from PIL import Image
    import numpy as np
    dummy = Image.fromarray(np.random.randint(0, 255, (300, 300, 3), dtype=np.uint8))
    t = transform(dummy)
    assert t.shape == (3, 224, 224), f"Unexpected tensor shape: {t.shape}"
    print(f"[OK]  Eval transform OK -- tensor shape: {t.shape}")
except Exception as e:
    print(f"[FAIL]  Transform test failed: {e}")
    sys.exit(1)

print("\n[PASS]  All smoke tests passed.\n")
print("Next steps:")
print("  1. Download dataset:  (see ai-service/README.md)")
print("  2. Prepare dataset:   python dataset/prepare_dataset.py")
print("  3. Train model:       python training/train.py")
print("  4. Evaluate:          python evaluation/evaluate.py")
print("  5. Predict:           python prediction/predict.py <image_path>")
