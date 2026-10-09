# AGROBUS — AI Soil Analysis Service

> **Prototype | Academic & Research Use**
> This module is in active development. Predictions are AI-assisted estimates
> and are NOT equivalent to certified laboratory soil tests.

---

## Overview

This `ai-service/` directory contains a standalone Python-based machine-learning
service for soil image classification. It lives inside the AGROBUS repository
but is completely independent of the Spring Boot backend and React frontend.

The service will eventually expose a REST API that Spring Boot can call, but at
this prototype stage it is run and tested as a standalone Python application.

---

## Folder Structure

```
ai-service/
├── config.py                   ← Central configuration (paths, hyperparameters)
├── requirements.txt            ← Python dependencies
├── test_smoke.py               ← Quick smoke test (no dataset needed)
├── .gitignore                  ← Excludes raw data, model weights, generated files
│
├── dataset/
│   ├── prepare_dataset.py      ← Verify + split raw dataset into train/val/test
│   ├── raw/                    ← (gitignored) Place downloaded images here
│   └── processed/              ← (gitignored) Auto-generated split directories
│       ├── train/
│       ├── val/
│       └── test/
│
├── training/
│   ├── model.py                ← EfficientNet-B0 model definition + save/load
│   └── train.py                ← Training loop with early stopping
│
├── evaluation/
│   ├── evaluate.py             ← Test metrics, confusion matrix, ROC curves
│   └── training_log.csv        ← (gitignored) Generated during training
│
├── prediction/
│   └── predict.py              ← CLI inference script for a single soil image
│
├── models/
│   └── saved/                  ← (gitignored) Trained .pth checkpoint files
│
├── api/
│   └── serve.py                ← FastAPI endpoint (Sprint 2, not needed yet)
│
├── utils/
│   └── data_utils.py           ← Transforms, DataLoader factory, image loader
│
└── notebooks/                  ← (optional) Jupyter exploration notebooks
```

---

## Dataset

| Field | Detail |
|---|---|
| **Name** | Soil Image Dataset |
| **Source** | https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset |
| **License** | [CDLA-Permissive-1.0](https://cdla.dev/permissive-1-0/) |
| **Classes** | Alluvial Soil, Black Soil, Clay Soil, Red Soil |
| **Images** | ~600–1 200 images (varies by version) |
| **Format** | RGB JPEG / PNG, varying resolutions |
| **Legal use** | ✅ Academic prototype ✅ Research ⚠ Attribution required |
| **Commercial** | Permitted under CDLA-Permissive but re-verify before production. |

### What CDLA-Permissive-1.0 means

- You **may use** the data for any purpose, including commercial.
- You **must attribute** the original dataset provider.
- You **do not need** to share back any changes or derived models.
- **Limitation**: The dataset was not collected from Rwandan soils.
  Model accuracy on local soil samples may differ significantly from
  the evaluation metrics reported here.

---

## Setup

### 1. Create a Python virtual environment

```bash
cd ai-service
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

> **GPU (optional but recommended):**
> If you have an NVIDIA GPU, install the CUDA version of PyTorch:
> ```bash
> pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
> ```

### 3. Verify the installation (no dataset needed)

```bash
python test_smoke.py
```

Expected output: `✨  All smoke tests passed.`

---

## Getting the Dataset

### Option A — Kaggle CLI (recommended)

```bash
pip install kaggle

# Place your kaggle.json token in ~/.kaggle/kaggle.json
# (Download from: https://www.kaggle.com/settings → API → Create New Token)

kaggle datasets download -d jayaprakashpondy/soil-image-dataset \
    -p dataset/raw --unzip
```

### Option B — Manual download

1. Go to: https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset
2. Click **Download** (requires a free Kaggle account).
3. Unzip the archive into `ai-service/dataset/raw/`.

The directory should look like:

```
dataset/raw/
  Alluvial Soil/
    image001.jpg
    ...
  Black Soil/
    ...
  Clay Soil/
    ...
  Red Soil/
    ...
```

---

## Quick Start

Run the commands below **from the `ai-service/` directory**:

### Step 1 — Prepare dataset

```bash
python dataset/prepare_dataset.py
```

Verifies class folders, prints per-class image counts, and builds the
stratified 70 / 15 / 15 train / val / test split into `dataset/processed/`.

### Step 2 — Train the model

```bash
python training/train.py
```

| Argument | Default | Description |
|---|---|---|
| `--epochs` | 20 | Total training epochs |
| `--batch-size` | 32 | Mini-batch size |
| `--lr` | 1e-4 | Initial learning rate |
| `--freeze-epochs` | 5 | Epochs to keep the backbone frozen |

Example with custom settings:

```bash
python training/train.py --epochs 30 --freeze-epochs 8 --batch-size 16
```

The best checkpoint is saved to `models/saved/soil_classifier_efficientnet_b0.pth`.

### Step 3 — Evaluate

```bash
python evaluation/evaluate.py
```

Outputs (saved to `evaluation/`):
- `evaluation_report.txt` — accuracy, precision, recall, F1 per class
- `confusion_matrix.png` — colour-coded confusion matrix
- `training_curves.png` — loss & accuracy vs epochs
- `roc_curves.png` — one-vs-rest ROC curves per class

### Step 4 — Predict a new image

```bash
python prediction/predict.py path/to/your/soil_photo.jpg
```

Example output:

```
┌────────────────────────────────────────────────────┐
│   AGROBUS Soil Analysis — Prediction Result        │
├────────────────────────────────────────────────────┤
│  Soil Type   :  Clay Soil                         │
│  Confidence  :   82.3 %                           │
│  Review Flag :  ✅  Not required                  │
├────────────────────────────────────────────────────┤
│  Top-K Predictions:                                │
│    1. Clay Soil                    82.3 %         │
│    2. Black Soil                   11.4 %         │
│    3. Alluvial Soil                 5.1 %         │
├────────────────────────────────────────────────────┤
│  DISCLAIMER: Prototype model — not a lab result.  │
└────────────────────────────────────────────────────┘
```

A full result JSON is also saved to `prediction_result.json`.

---

## Confidence-Based Human Review

The AI Soil Analysis service uses model confidence to gate predictions and request human intervention.

1. **Why confidence is used:** Rather than predicting blindly, the model quantifies uncertainty. If unsure, it defers to a human instead of presenting a potentially incorrect result to a farmer.
2. **What HIGH/MEDIUM/LOW mean:**
   - **HIGH (≥ 80%)**: The model has recognized the image clearly. The AI-assisted result can be presented normally.
   - **MEDIUM (50 - 79%)**: The prediction is borderline. Agronomist review is recommended.
   - **LOW (< 50%)**: The model is uncertain (e.g., blurry image, poor lighting). Review is strictly required; the sample may need a re-photo or lab test.
3. **Why low-confidence predictions are reviewed:** To prevent misguided crop choices or incorrect fertilizer application, which cost smallholder farmers money.
4. **Not a lab replacement:** AI visual classification does not measure chemical compositions (pH, NPK). The disclaimer remains: *Prototype model — not a laboratory soil test.*
5. **Future agronomist validation:** In later AGROBUS sprints, flagged images will be routed to a dashboard where agronomists can approve, correct, or reject the AI result, turning human feedback into valuable future training data.
6. **Calibration note:** The 80% and 50% thresholds are initial engineering values. They require future calibration against field validation data to balance automation vs. accuracy.

---

## AI Architecture

| Component | Choice | Rationale |
|---|---|---|
| Base model | EfficientNet-B0 | High accuracy / low parameter count; proven on image classification |
| Pre-training | ImageNet (timm) | Provides robust feature extractor from day 1 |
| Transfer learning | 2-phase freeze/unfreeze | Prevents overwriting pre-trained features early |
| Optimiser | AdamW | Weight decay + adaptive LR; well-suited for fine-tuning |
| Loss function | CrossEntropy + label smoothing | Reduces overconfidence on small dataset |
| Scheduler | CosineAnnealingLR | Smooth LR decay; avoids sharp local minima |
| Early stopping | patience=5 | Prevents overfitting when val accuracy plateaus |

---

## Future API Integration (Sprint 2)

The `api/serve.py` file contains a FastAPI application that Spring Boot will call:

```bash
uvicorn api.serve:app --reload --port 8001
```

Endpoint:

```
POST http://localhost:8001/api/v1/soil/predict
Content-Type: multipart/form-data
Body: file=<soil_image>
```

This is **not needed** for the first prototype test. It is scaffolded here for
reference and future Sprint 2 integration.

---

## Known Limitations

1. **No Rwanda-specific training data.** The Kaggle dataset was not collected from
   Rwandan or East African soils. Predictions on local samples may be less accurate.
2. **Visual classification only.** The model cannot measure pH, NPK, moisture, CEC,
   or any other chemical soil property from an image alone.
3. **Small dataset.** ~600–1 200 images is sufficient for a prototype but not for
   production. Accuracy will improve significantly with more labelled local data.
4. **Image quality sensitivity.** Results depend on lighting, camera angle, and
   whether the image shows the actual soil profile.
5. **No temporal context.** Season, recent rainfall, and field history are not
   considered in this prototype.

---

## Roadmap

- [x] Sprint 1 — Soil image classification foundation (this deliverable)
- [ ] Sprint 2 — FastAPI REST endpoint + Spring Boot integration
- [ ] Sprint 3 — Rwanda-local dataset collection strategy
- [ ] Sprint 4 — pH / NPK regression model (requires paired image + lab data)
- [ ] Sprint 5 — Agronomist review workflow in AGROBUS UI
- [ ] Sprint 6 — Crop and input recommendations driven by validated soil analysis

---

## Attribution

Dataset: *Soil Image Dataset* by Jayaprakash Pondy, available at
https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset
Released under CDLA-Permissive-1.0.
