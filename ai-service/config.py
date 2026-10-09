"""
AGROBUS — AI Soil Analysis Service
Central configuration module.

All paths, hyper-parameters, and dataset constants live here so that
every other script imports a single source of truth rather than
duplicating magic strings.
"""

import os
from pathlib import Path

# ── Directory layout ────────────────────────────────────────────────────────
AI_SERVICE_ROOT = Path(__file__).parent.resolve()

DATASET_DIR     = AI_SERVICE_ROOT / "dataset"
RAW_DIR         = DATASET_DIR / "raw"
PROCESSED_DIR   = DATASET_DIR / "processed"

MODELS_DIR      = AI_SERVICE_ROOT / "models" / "saved"
EVALUATION_DIR  = AI_SERVICE_ROOT / "evaluation"

# ── Dataset ─────────────────────────────────────────────────────────────────
# Soil Image Dataset — 12-class soil texture / colour dataset from Kaggle
# Source : https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset
# License: Community Data License Agreement — Permissive (CDLA-Permissive-1.0)
#          Free for academic, research, and prototype use.
#          Attribution required; sharing of models derived from the data is
#          recommended but not legally mandated under CDLA-Permissive-1.0.
# Classes: Alluvial Soil, Black Soil, Clay Soil, Red Soil
#          (4 primary classes present in this release; more may be added when
#           additional labelled Rwanda-specific imagery becomes available)
DATASET_NAME    = "jayaprakashpondy/soil-image-dataset"
DATASET_SOURCE  = "https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset"
DATASET_LICENSE = "CDLA-Permissive-1.0"

# Expected sub-folder names inside RAW_DIR after extraction
# (adjust to match actual folder names after you unzip the Kaggle dataset)
CLASS_NAMES = [
    "Alluvial Soil",
    "Black Soil",
    "Clay Soil",
    "Red Soil",
]

NUM_CLASSES = len(CLASS_NAMES)

# ── Image preprocessing ──────────────────────────────────────────────────────
IMAGE_SIZE   = 224          # pixels — matches EfficientNet-B0 input
MEAN         = (0.485, 0.456, 0.406)   # ImageNet normalisation
STD          = (0.229, 0.224, 0.225)

# ── Train / Val / Test split ─────────────────────────────────────────────────
TRAIN_RATIO  = 0.70
VAL_RATIO    = 0.15
TEST_RATIO   = 0.15
RANDOM_SEED  = 42

# ── Training hyper-parameters ────────────────────────────────────────────────
BATCH_SIZE       = 32
NUM_EPOCHS       = 20
LEARNING_RATE    = 1e-4
WEIGHT_DECAY     = 1e-4
PATIENCE         = 5          # early-stopping patience (epochs)
NUM_WORKERS      = 0          # set to 0 on Windows to avoid multiprocessing issues

# ── Model ────────────────────────────────────────────────────────────────────
MODEL_ARCH       = "efficientnet_b0"   # timm model ID
PRETRAINED       = True
DROPOUT_RATE     = 0.3

# File names
MODEL_FILENAME   = "soil_classifier_efficientnet_b0.pth"
MODEL_PATH       = MODELS_DIR / MODEL_FILENAME

# ── Confidence thresholds ────────────────────────────────────────────────────
# Note: These are initial engineering thresholds only and must be calibrated
# later using additional field validation data.
HIGH_CONFIDENCE   = 0.80   # ≥ 80 % → HIGH (Assisted result)
MEDIUM_CONFIDENCE = 0.50   # 50 - 79 % → MEDIUM (Review recommended), < 50 % → LOW (Review required)
