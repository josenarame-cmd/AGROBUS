# AGROBUS — Agricultural Input Credit Platform

## Overview

AGROBUS is a full-stack web application that digitises the lifecycle of **agricultural input credit** for smallholder farmers. It targets regions like Rwanda where access to seeds, fertilisers, and pesticides on credit is a key driver of food security and farm productivity. The platform connects three roles — **Admins**, **Field Agents**, and **Farmers** — through a single secured web interface.

---

## Purpose

Smallholder farmers often cannot afford agricultural inputs (seeds, fertiliser, pesticides) upfront at the start of a growing season. AGROBUS allows:

1. A **Farmer** to request inputs on credit (a "loan").
2. A **Field Agent** to review, approve, and track delivery of those inputs.
3. An **Admin** to oversee all operations, manage stock, manage agents, and view system-wide analytics.
4. **Repayments** to be recorded as farmers sell their harvest, with automatic loan closure when the balance reaches zero.

The system also tracks agricultural input stock levels, fires low-stock alerts, and maintains a running credit score per farmer.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Recharts│
│  Port: 5173 (dev) — proxied to backend via /api             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / JSON (Axios)
                         │ JWT Bearer token
┌────────────────────────▼────────────────────────────────────┐
│                     BACKEND (Spring Boot)                    │
│  Java 21 · Spring Boot 3.5 · Spring Security 6              │
│  Spring Data JPA · JJWT 0.12.6 · Bean Validation            │
│  Port: 8080                                                  │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │Controllers│  │ Services │  │   Repos  │  │  Security  │  │
│  │ (REST)   │→ │(Business │→ │  (JPA)   │→ │ JWT + OAuth│  │
│  │          │  │  Logic)  │  │          │  │  (Google)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ JPA / JDBC
┌────────────────────────▼────────────────────────────────────┐
│                      DATABASE                                │
│  H2 (in-memory, dev) — drop-in replaceable with MySQL       │
└─────────────────────────────────────────────────────────────┘
```

---

## Domain Model

### Entities and Relationships

```
User (id, email, password, fullName, phone, pictureUrl,
      authProvider[LOCAL|GOOGLE], role[ADMIN|AGENT|FARMER], active)
  │
  ├── 1:1 ──► Agent (id, fullName, phone, assignedDistrict, status)
  │                └── 1:N ──► Farmer (id, fullName, nationalId, phone,
  │                                    gender, district, sector, farmSize,
  │                                    cropType, creditScore, status,
  │                                    userId FK → User)
  │                                    └── 1:N ──► Loan (id, cropType,
  │                                    │               requestedInputs,
  │                                    │               estimatedCost,
  │                                    │               status[PENDING|APPROVED|
  │                                    │                      REJECTED|DELIVERED|REPAID],
  │                                    │               amountRepaid,
  │                                    │               remainingBalance)
  │                                    │               └── 1:N ──► Repayment
  │                                    │                          (amountPaid,
  │                                    │                           paymentMethod,
  │                                    │                           transactionRef)
  │                                    └── 1:N ──► Farm (name, district,
  │                                                      sector, sizeHectares,
  │                                                      primaryCrop)
  │
  └── (Notification — recipientId links to User.id, no FK by design
       to allow role-broadcast notifications)

AgriculturalInput (inputName, category[SEEDS|FERTILIZERS|PESTICIDES],
                   quantityAvailable, quantityDistributed,
                   unitPrice, expirationDate, lowStockThreshold)
    └── M:1 ──► Supplier (name, contactPerson, phone, email, address)
```

### Credit Score Rules
- Default score on registration: **500**
- On-time repayment (loan fully repaid): **+10**
- Loan rejected: **−20**
- Minimum score: **300** | Maximum score: **850**

---

## Roles & Permissions

| Feature | ADMIN | AGENT | FARMER |
|---------|:-----:|:------:|:------:|
| Manage Farmers | ✅ | ✅ | ❌ |
| Manage Agents | ✅ | ✅ | ❌ |
| Manage Loans | ✅ | ✅ | ❌ |
| Approve / Reject Loans | ✅ | ✅ | ❌ |
| Manage Inputs & Stock | ✅ | ✅ | ❌ |
| Manage Suppliers | ✅ | ✅ | ❌ |
| View Dashboard Analytics | ✅ | ✅ | ❌ |
| View Own Loans | ❌ | ❌ | ✅ |
| View Own Repayments | ❌ | ❌ | ✅ |
| Manage Own Farms | ❌ | ❌ | ✅ |
| View Own Notifications | ❌ | ❌ | ✅ |
| Update Own Profile | ✅ | ✅ | ✅ |

---

## REST API Summary

All endpoints are prefixed with `/api`. Endpoints marked 🔒 require a valid JWT Bearer token.

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Email + password login |
| POST | `/auth/register` | Public | Register new FARMER account |
| GET | `/auth/me` | 🔒 Any | Get current user profile |
| PUT | `/auth/profile` | 🔒 Any | Update fullName / phone |
| GET | `/oauth2/authorization/google` | Public | Start Google OAuth2 flow |

### Farmers (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/farmers` | Paginated search (search, district, cropType params) |
| GET | `/farmers/all` | All farmers (no pagination) |
| POST | `/farmers` | Create farmer |
| PUT | `/farmers/{id}` | Update farmer |
| DELETE | `/farmers/{id}` | Delete farmer |
| GET | `/farmers/{id}` | Get farmer by ID |
| GET | `/farmers/districts` | Distinct districts |
| GET | `/farmers/crop-types` | Distinct crop types |
| GET | `/farmers/unassigned` | Farmers with no assigned agent |

### Farmer Self-Service (FARMER only)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/farmer/farms` | List own farms |
| POST | `/farmer/farms` | Create farm |
| PUT | `/farmer/farms/{id}` | Update own farm |
| DELETE | `/farmer/farms/{id}` | Delete own farm |
| GET | `/farmer/loans` | View own loans |
| GET | `/farmer/repayments` | View own repayments |
| GET | `/farmer/notifications` | View own notifications |
| GET | `/farmer/dashboard` | Personal financial summary |

### Loans (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/loans` | Paginated list |
| POST | `/loans` | Create loan request |
| PUT | `/loans/{id}/approve` | Approve loan |
| PUT | `/loans/{id}/reject` | Reject loan (body: `{reason}`) |
| PUT | `/loans/{id}/deliver` | Mark inputs as delivered |
| GET | `/loans/{id}` | Get loan by ID |
| GET | `/loans/status/{status}` | Filter by status |
| GET | `/loans/farmer/{farmerId}` | Loans for a farmer |
| GET | `/loans/recent` | Most recent loans |

### Agricultural Inputs (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/inputs` | All inputs |
| POST | `/inputs` | Create input item |
| PUT | `/inputs/{id}` | Update input |
| DELETE | `/inputs/{id}` | Delete input |
| GET | `/inputs/{id}` | Get by ID |
| GET | `/inputs/category/{category}` | Filter by category |
| GET | `/inputs/low-stock` | Items below threshold |
| POST | `/inputs/{id}/distribute` | Distribute stock (reduce quantity) |

### Agents (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/agents` | All agents |
| POST | `/agents` | Create agent |
| PUT | `/agents/{id}` | Update agent |
| DELETE | `/agents/{id}` | Delete agent |
| POST | `/agents/{id}/assign-farmer` | Assign farmer to agent |
| GET | `/agents/{id}/farmers` | Get agent's farmers |

### Repayments (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/repayments` | All repayments |
| POST | `/repayments` | Record repayment |
| GET | `/repayments/loan/{loanId}` | Repayments for a loan |
| GET | `/repayments/farmer/{farmerId}` | Repayments for a farmer |
| GET | `/repayments/total` | Total amount repaid |

### Suppliers (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/suppliers` | All suppliers |
| POST | `/suppliers` | Create supplier |
| PUT | `/suppliers/{id}` | Update supplier |
| DELETE | `/suppliers/{id}` | Delete supplier |
| GET | `/suppliers/{id}` | Get supplier by ID |
| GET | `/suppliers/active` | Active suppliers only |

### Notifications (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | All notifications (paginated) |
| GET | `/notifications/unread/{userId}` | Unread for user |
| GET | `/notifications/unread-count/{userId}` | Unread count |
| PUT | `/notifications/{id}/read` | Mark as read |

### Dashboard (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Full analytics: counts, totals, trend charts, activity feed |

---

## Security

- **JWT**: HMAC-SHA256, 24-hour expiry, secret via `JWT_SECRET` env var.
- **Google OAuth2**: Registered app on Google Cloud. Redirect URI: `http://localhost:8080/login/oauth2/code/google`. On success, JWT is returned in the URL fragment to `{frontend}/oauth/callback`.
- **Session policy**: `IF_REQUIRED` (stateful for OAuth2 flow; stateless for API calls via JWT filter).
- **CORS**: Allowed for `http://localhost:5173` and `http://localhost:3000`.

---

## Seeded Test Users

On application startup, the following users are automatically created if they do not exist:

| Role | Email | Password |
|------|-------|----------|
| ADMIN | `admin@agrobus.rw` | `Admin@1234` |
| AGENT | `agent@agrobus.rw` | `Agent@1234` |

Farmers self-register or are created by agents/admins.

---

## Running Locally

### Backend
```bash
cd backend
./mvnw spring-boot:run
# API available at http://localhost:8080
# H2 console at http://localhost:8080/h2-console
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### Environment Variables (Backend)
| Variable | Default | Purpose |
|----------|---------|---------|
| `JWT_SECRET` | (hardcoded fallback) | JWT signing secret — **change in production** |
| `JWT_EXPIRATION` | `86400000` (24h) | Token TTL in milliseconds |
| `FRONTEND_URL` | `http://localhost:5173` | OAuth2 redirect base URL |

---

## Project Status

### Implemented ✅
- User authentication (local + Google OAuth2)
- Farmer CRUD with search, filtering, and pagination
- Agent management and farmer assignment
- Agricultural input stock management with low-stock alerts
- Full loan lifecycle (PENDING → APPROVED → DELIVERED → REPAID)
- Repayment recording with automatic balance tracking
- Notification system (created by services, polled by frontend)
- Dashboard aggregation with trend charts
- Farmer farm management (own farms)
- Farmer self-service endpoints (own loans, repayments, notifications)
- Supplier management (CRUD)
- Credit score updates on repayment and rejection
- Startup data seeding for ADMIN and AGENT users
- Role-based access control (ADMIN / AGENT / FARMER)
- Global exception handling with structured JSON error responses

### Planned / Future Work 🔜
- MySQL/PostgreSQL for production persistence
- Real-time notifications via WebSocket / SSE
- USSD gateway integration (*810#)
- Crop, harvest, and produce sale tracking
- Expert advisory messaging system
- IoT / smart farm device telemetry
- Email / SMS notification delivery
- Multi-tenancy / organisation support
- Automated tests (unit + integration)
- Docker Compose deployment manifest

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3.5 |
| Security | Spring Security 6 + JJWT 0.12.6 |
| ORM | Spring Data JPA + Hibernate |
| Database (dev) | H2 in-memory |
| Frontend | React 19 + TypeScript + Vite 6 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| HTTP client | Axios |
| UI icons | Lucide React |
| Build | Maven (backend), npm (frontend) |

## Hackathon AI Prototype — Added

The farmer experience now includes an **AI Farm Advisor** at `/farmer/crop-recommendations`.

### AI recommendation flow

```text
Farmer / Farm
      ↓
Soil + moisture + temperature + rainfall data
      ↓
AgroBus Explainable AI v1
      ↓
Crop fit score + confidence + reasons
      ↓
Recommended seeds + fertilizer + protection inputs
      ↓
Existing AgroBus input/credit workflow
```

### New endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/farmer/ai/recommend` | FARMER | Returns an explainable crop and input recommendation from structured farm conditions |

The current hackathon model is intentionally **explainable and deterministic**. It scores candidate crops against soil type, pH, moisture, temperature and expected rainfall. It is designed as a prototype inference layer that can later be replaced or augmented with a trained ML model and live IoT/weather data.

The UI explicitly identifies the output as a prototype recommendation and advises validation with local agronomy/extension guidance before field use.

---

## AI Soil Analysis Module

> **Status:** Sprint 1 — Foundation & Prototype (standalone Python service)
> **Location:** `ai-service/` (independent of Spring Boot and React)

### 1. Motivation

Smallholder farmers in Rwanda and across East Africa often lack affordable
access to timely soil testing. Laboratory soil analysis can cost USD 30–100
per sample, take days to weeks, and requires transport to urban centres.
As a result, farmers make crop selection and fertiliser decisions based on
experience and traditional knowledge alone, leading to sub-optimal yields
and input waste.

AGROBUS aims to address this gap by providing an AI-assisted soil screening
tool that a farmer or field agent can use in the field with only a smartphone
camera — bringing preliminary soil type information to the point of need.

### 2. Problem Being Addressed

- No access to affordable soil testing in rural Rwanda.
- Crop choices are made without knowledge of soil type or condition.
- AGROBUS already handles input credit loans — connecting soil information
  to input recommendations will improve loan precision and repayment rates.

### 3. Proposed AI Solution

A computer vision model (EfficientNet-B0, fine-tuned via transfer learning)
classifies a photograph of a soil sample into a soil type category.
The output is an AI-assisted estimate with a confidence score, not a
laboratory measurement.

The intended workflow:

```
Soil Photo (smartphone)
      ↓
AI Soil Classification
      ↓
Soil Type Estimate + Confidence Score
      ↓
If confidence < 75%: Flag for Agronomist Review
      ↓
Validated Soil Type → (Future) Crop & Input Suggestion
```

### 4. Why AI Instead of Continuous IoT Sensing

| Approach | IoT Sensors | AI Vision |
|---|---|---|
| Cost per farmer | USD 200–500+ per device | Smartphone (already owned) |
| Connectivity needed | AlwayAS-on (GPRS/3G) | One-time image upload |
| Maintenance | Hardware failure, battery, theft | App update only |
| Scalability | Limited by device cost | Scales to all farmers instantly |
| Data richness | Chemical reading (accurate) | Visual screening (indicative) |

AI vision is not a replacement for soil sensors or laboratory testing.
It is a lower-cost, first-pass screening layer that makes soil-awareness
accessible to farmers who currently have no information at all.

### 5. Current Prototype Scope

Sprint 1 delivers:
- Dataset identification and documentation
- Python environment configuration
- Dataset preparation script (train/val/test split)
- Model training script (EfficientNet-B0, transfer learning)
- Evaluation script (accuracy, precision/recall/F1, confusion matrix, ROC)
- Prediction script for a single soil image
- Stub FastAPI endpoint (Sprint 2 integration point)

**Not in scope for Sprint 1:**
- pH, NPK, moisture, or any chemical property estimation
- Crop recommendations
- Fertiliser recommendations
- AGROBUS frontend or backend integration
- Rwanda-specific dataset

### 6. Dataset Source

| Field | Value |
|---|---|
| Name | Soil Image Dataset |
| Provider | Jayaprakash Pondy |
| Platform | Kaggle |
| URL | https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset |

### 7. Dataset License

**CDLA-Permissive-1.0** (Community Data License Agreement — Permissive)

- ✅ Academic and research use — permitted
- ✅ Prototype and commercial use — permitted
- ✅ Model derivation — permitted
- ⚠ Attribution required — cite the dataset in publications and documentation
- ⚠ Not sourced from Rwandan soils — validation with local samples is required

### 8. AI Architecture

```
Input: RGB soil photograph (any resolution)
      ↓
Resize + RandomCrop(224×224) + Normalise (ImageNet μ/σ)
      ↓
EfficientNet-B0 Feature Extractor (pretrained on ImageNet)
      ↓
Dropout(0.3) → Linear(1280 → 4)
      ↓
Softmax → class probabilities [0, 1]
      ↓
argmax → predicted soil type
      ↓
confidence = max(probabilities) × 100 %
```

### 9. Model Selected

**EfficientNet-B0** (via `timm` library, ImageNet pre-trained)

| Property | Value |
|---|---|
| Parameters | ~5.3 M total |
| Input size | 224 × 224 RGB |
| Output | 4-class softmax |
| Pre-training | ImageNet-1K |
| Top-1 ImageNet | 77.1 % |
| Training hardware | CPU or CUDA GPU |

Rationale: strong accuracy-to-size ratio; fits on a laptop GPU or CPU;
scales to B3/B5 if accuracy needs to improve later.

### 10. Training Methodology

Two-phase transfer learning strategy:

**Phase 1 (epochs 1–5, configurable):**
- Backbone weights frozen (ImageNet features preserved)
- Only the new classifier head is trained
- Learning rate: 1×10⁻⁴

**Phase 2 (remaining epochs):**
- All layers unfrozen
- End-to-end fine-tuning with lower LR (1×10⁻⁵)
- CosineAnnealingLR scheduler

Additional techniques:
- Data augmentation: random crop, flip, colour jitter, rotation
- Label smoothing (0.1) reduces overconfidence
- AdamW optimiser with weight decay
- Early stopping (patience=5) prevents overfitting

Split: 70 % train / 15 % validation / 15 % test (stratified).

### 11. Evaluation Results

Evaluation metrics are generated by running `python evaluation/evaluate.py`
after training. Results will be appended here after the first training run.

Metrics reported:
- Test accuracy (%)
- Precision / Recall / F1 per class
- Macro and weighted averages
- Confusion matrix (PNG)
- ROC-AUC per class (one-vs-rest)
- Training and validation loss/accuracy curves (PNG)

> ⚠ Placeholder — will be filled after first training run on the dataset.

### 12. Limitations

1. **Not a laboratory replacement.** Cannot measure pH, NPK, CEC, moisture,
   or any chemical soil property from visual information alone.
2. **No Rwanda-specific training data** in Sprint 1. Accuracy on local soil
   samples is unknown and may differ significantly from reported test metrics.
3. **Small dataset.** ~600–1 200 images is sufficient for a prototype but
   limited for production reliability.
4. **Visual classification only.** Performance depends on image quality,
   lighting, and whether raw soil (not planted surface) is photographed.
5. **4 generic soil classes.** Real AGROBUS deployment will need Rwanda-specific
   soil taxonomy and labelled local images.

### 13. AI Soil Analysis — Human Review Workflow

The system enforces a **confidence-gated review workflow**:

```text
Soil Image
    ↓
EfficientNet-B0
    ↓
Soil Classification
    ↓
Confidence Score
    ↓
Confidence Assessment
    ↓
 ┌───────────────────────┐
 │                       │
 HIGH                  MEDIUM/LOW
 │                       │
 ↓                       ↓
AI-assisted result    Human Review
                         ↓
                   Agronomist
                         ↓
                 Approved/Corrected
```

Human feedback (corrections/approvals) can later become valuable training and validation data.

#### Future Architecture (Not yet implemented)
```text
Farmer
  ↓
Upload Soil Image
  ↓
AI Soil Classification
  ↓
Confidence Assessment
  ↓
High Confidence
  → AI-assisted result

Low/Medium Confidence
  → Agronomist Review

Agronomist Result
  ↓
Validated Soil Classification
  ↓
Future Model Improvement
```
*Note: In future sprints (Sprints 2+), the AI service will integrate with the Spring Boot Backend which powers the AGROBUS React Frontend.*

### 14. Future Integration with AGROBUS

Planned integration path:

1. **Sprint 2**: FastAPI endpoint (`api/serve.py`) is tested and exposed
   internally. Spring Boot `SoilAnalysisService` added to call it.
2. **Sprint 3**: Farmer dashboard gains "Soil Analysis" page.
   Farmers submit photo + metadata (location, season, farm size).
3. **Sprint 4**: Validated soil type linked to AGROBUS input catalogue.
   Field agents receive soil-aware input recommendations.
4. **Sprint 5**: Crop recommendations driven by validated soil + season data.
5. **Sprint 6**: Loan requests can be pre-populated with AI-derived crop and
   input suggestions, improving loan accuracy and repayment prediction.

### 15. Future Rwanda-Specific Dataset Strategy

To improve accuracy for AGROBUS's target geography:

1. **Field data collection**: Partner with Rwanda Agriculture Board (RAB) and
   local agronomists to photograph and label soil samples from Rwandan farms.
2. **Paired data**: Collect soil images alongside laboratory measurements
   (pH, NPK) for future regression model development.
3. **Transfer to local model**: Fine-tune on Rwanda-specific data once
   collected. Existing EfficientNet-B0 checkpoint serves as starting point.
4. **Continuou improvement**: As the AGROBUS platform scales, farmer-uploaded
   images with agronomist-verified labels create a growing local dataset.
5. **Research partners**: Collaborate with UR-CAVM (University of Rwanda,
   College of Agriculture, Animal Sciences and Veterinary Medicine) for
   scientifically validated ground-truth labels.

### Running the AI Service

```bash
cd ai-service

# 1. Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Smoke test (no dataset needed)
python test_smoke.py

# 4. Download dataset (see ai-service/README.md for options)

# 5. Prepare dataset
python dataset/prepare_dataset.py

# 6. Train
python training/train.py

# 7. Evaluate
python evaluation/evaluate.py

# 8. Predict a soil image
python prediction/predict.py path/to/soil_image.jpg
```
