# PHASE 2.3 — DATA ACQUISITION PLAN
> **Status:** BLOCKED — Waiting for real Rwanda soil samples, photographs, and laboratory measurements
> **Prerequisite:** Phase 2.2 Complete (DONE)
> **Rule:** Do NOT mark Phase 2.3 complete until real data passes the validator.
> **Rule:** Do NOT train any Phase 2 model until Phase 2.3 is complete.

---

## Objective
Define exactly what AGROBUS must acquire before Phase 2.3 can be marked COMPLETE
and Phase 2.4 (Dataset Organization) can begin.

This document also specifies the future experimental design (location-aware modeling)
and the target system architecture. Those sections are planning documents only —
not implemented and not validated.

---

## 1. What AGROBUS Needs

```
For every soil sample:

  ONE UNIQUE SAMPLE ID
          +
  RGB PHOTOGRAPH(S)      ← captured in the field per image protocol
          +
  LABORATORY RESULT      ← from accredited laboratory analysis
          +
  LOCATION METADATA      ← district, sector, GPS (where available)
```

All three elements MUST be linked by the same Sample ID.
A record missing any of the three elements cannot be used for model training.

---

## 2. Field Collection vs Laboratory vs Context Sources

| Data Field          | Source                  | Mandatory | Notes                              |
|---------------------|-------------------------|-----------|------------------------------------|
| `sample_id`         | Field team              | YES       | Pre-generated before fieldwork     |
| `image_id`          | Field team              | YES       | Derived from sample_id             |
| `image_path`        | Field team              | YES       | Per image protocol                 |
| `district`          | Field team              | YES       | Rwanda administrative district     |
| `sector`            | Field team              | YES       | Rwanda administrative sector       |
| `collection_date`   | Field team              | YES       | YYYY-MM-DD                         |
| `depth_cm`          | Field team              | YES       | Actual depth — do not assume 0-20  |
| `collection_method` | Field team              | YES       | Auger, spade, composite            |
| `latitude`          | GPS device/smartphone   | RECOMMENDED | Jitter before public release     |
| `longitude`         | GPS device/smartphone   | RECOMMENDED | Jitter before public release     |
| `elevation_m`       | GPS or DEM lookup       | OPTIONAL  | Can be derived from coordinates    |
| `season`            | Field team              | RECOMMENDED | Season A / B / C                  |
| `crop`              | Field team              | OPTIONAL  | Current/previous crop              |
| `device_model`      | Field team              | YES       | Smartphone model used              |
| `lighting_condition`| Field team              | YES       | Daylight / Overcast / Indoor       |
| `ph`                | Laboratory              | YES       | Must come from accredited lab      |
| `organic_matter_pct`| Laboratory              | YES       | Must come from accredited lab      |
| `phosphorus_ppm`    | Laboratory              | RECOMMENDED | Depends on lab capability        |
| `potassium_ppm`     | Laboratory              | RECOMMENDED | Depends on lab capability        |
| `nitrogen_pct`      | Laboratory              | OPTIONAL  | Volatile — confirm with lab        |
| `moisture_pct`      | Laboratory              | OPTIONAL  | Only if lab uses gravimetric method|
| `laboratory`        | Laboratory              | YES       | Full name of laboratory            |
| `measurement_method`| Laboratory              | YES       | One per property                   |
| `measurement_date`  | Laboratory              | YES       | Date analysis was completed        |
| `lab_report_ref`    | Laboratory              | YES       | Laboratory report reference number |
| `detection_limit`   | Laboratory              | RECOMMENDED | Per property                     |

---

## 3. Minimum Viable Dataset for Phase 2 Training

To begin training any Phase 2 soil property model, the minimum requirements are:

| Requirement                       | Minimum Target       |
|-----------------------------------|----------------------|
| Physical samples with lab results | 100 (prototype)      |
| Per high-priority agro-zone       | 20-30 samples        |
| Images per sample                 | 3                    |
| Minimum total images              | 300                  |
| Required lab properties           | pH + Organic Matter  |
| Sample ID matching rate           | 100%                 |
| Acceptable missing lab values     | < 10% per property   |

> **NOTE:** 100 samples is the minimum for a feasibility study. A production model
> would require several hundred samples per agro-ecological zone.

---

## 4. Acquisition Timeline (Template)

| Week  | Activity                                    | Responsible     |
|-------|---------------------------------------------|-----------------|
| W1    | Contact RAB — request RwaSIS data agreement | AGROBUS team    |
| W1    | Identify and brief field data collectors    | AGROBUS team    |
| W1-2  | Generate Sample ID batch (RW-SOIL-0001+)    | AGROBUS team    |
| W2-4  | Field data collection — Eastern Province    | Field team      |
| W2-4  | Field data collection — Northern Province   | Field team      |
| W3-5  | Laboratory submission and analysis          | Laboratory      |
| W5-6  | Receive laboratory results                  | AGROBUS team    |
| W6    | Run Phase 2 dataset validator               | AI team         |
| W6    | Phase 2.4 begins if validation passes       | AI team         |

---

## 5. Rwanda Image Availability Investigation

> **Status: NO VERIFIED PUBLIC RWANDA IMAGE-LAB DATASET FOUND**

A review of publicly accessible soil data sources was conducted to determine
whether any legitimate Rwanda-specific resource provides:

```
soil sample  +  RGB photograph  +  laboratory result  +  sample ID
```

| Source                          | Images? | Lab Results? | Rwanda-Specific? | Usable? |
|---------------------------------|---------|--------------|------------------|---------|
| RwaSIS (RAB)                    | Unknown | Yes           | Yes              | Pending RAB response |
| iSDAsoil                        | No      | Modelled (not lab) | Yes (coverage) | NO — predicted maps are not lab measurements |
| ISRIC / WoSIS                   | No      | Some profiles | Limited Rwanda   | NO — no images |
| AfSIS datasets                  | No      | Yes           | Partial           | NO — no images |
| Kaggle soil datasets            | Yes     | No            | No (India-biased) | NO — no lab, not Rwanda |
| Academic publications (searched)| None found with paired image+lab+ID for Rwanda | — | — | NO |

**Conclusion:**
No verified public Rwanda soil dataset was found that provides paired
RGB images + laboratory measurements + sample IDs.

AGROBUS must collect this data through:
1. A formal RAB/RwaSIS data request (see RAB checklist)
2. Original field collection using the field protocol (see field checklist)

---

## 6. Future Location-Aware Modeling Plan

> **NOTE: PLANNING ONLY — No model will be trained until real data is available.**

Once real Rwanda data is collected, Phase 2 experiments will compare two architectures:

### Model A — Image Only
```
Input:  RGB soil photograph
Output: Predicted soil property (e.g., pH, organic matter)
Purpose: Baseline — what can be learned from image alone?
```

### Model B — Image + Rwanda Location/Context
```
Input:  RGB soil photograph
        + geographic context:
            - latitude
            - longitude
            - district
            - sector
            - elevation_m
        + temporal/agronomic context (if available):
            - season (A/B/C)
            - rainfall_category
            - crop
Output: Predicted soil property
Purpose: Does location context improve predictions for Rwanda?
```

### Geographic Leakage Prevention

When training Model B, the following rules apply without exception:

| Rule | Reason |
|------|--------|
| Train/val/test split must be by geographic fold (district or sector), not random | Random split allows the model to memorize GPS clusters, inflating accuracy |
| A model trained on Sector X must not be validated using samples from Sector X | Geographic leakage |
| Coordinates must be jittered before public release | Privacy — GPS can identify individual farmers' plots |
| Model B accuracy must be compared to Model A on same held-out fold | To quantify the value added by location context |
| Reported metrics must state which fold strategy was used | Scientific reproducibility |

### What Context Fields Will Be Used

| Field          | Type    | Source                        | Required for Model B? |
|----------------|---------|-------------------------------|------------------------|
| `latitude`     | float   | GPS at collection             | Strongly recommended   |
| `longitude`    | float   | GPS at collection             | Strongly recommended   |
| `district`     | string  | Field team                    | Yes                    |
| `sector`       | string  | Field team                    | Yes                    |
| `elevation_m`  | integer | GPS or DEM lookup             | Optional               |
| `season`       | string  | Field team (A/B/C)            | Recommended            |
| `crop`         | string  | Field team                    | Optional               |
| `rainfall_cat` | string  | Climate data lookup           | Optional               |

---

## 7. Target System Architecture

> **IMPORTANT: This is the TARGET ARCHITECTURE. It is NOT yet validated or implemented.**
> **No component of this architecture should be deployed to farmers until**
> **each stage has been tested with real Rwanda data and independently verified.**

```
┌─────────────────────────────────────────────────────────────────┐
│                        SYSTEM INPUTS                            │
│                                                                 │
│   Soil Image (RGB photograph, per image protocol)               │
│         +                                                       │
│   Rwanda Location (district, sector, GPS, elevation)            │
│         +                                                       │
│   Context (season, crop, rainfall category)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI SOIL MODEL                                │
│                                                                 │
│   Phase 1 (operational): Soil Type Classifier                   │
│   Phase 2 (BLOCKED — data required): Property Estimator         │
│     Supported properties (when model trained & validated):      │
│       - pH                                                      │
│       - Organic Matter (%)                                      │
│       - Phosphorus (ppm) — if lab data available               │
│       - Potassium (ppm)  — if lab data available               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AGRONOMIC INTERPRETATION                       │
│                                                                 │
│   Translate model output into farmer-readable language:         │
│     - "Soil pH is slightly acidic (6.1–6.5)"                   │
│     - "Organic matter is low — consider compost addition"       │
│     - Confidence score and uncertainty estimate mandatory       │
│     - Low-confidence output must NOT be shown to farmers        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CROP RECOMMENDATION                           │
│                                                                 │
│   Based on soil properties + farmer's intended crop:            │
│     - Crop suitability assessment                               │
│     - Variety recommendation (Rwanda-specific)                  │
│     - Agronomic calendar notes                                  │
│   Source: Rwanda-validated agronomic rules (not AI guessing)    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│               INPUT / FERTILIZER RECOMMENDATION                 │
│                                                                 │
│   Based on soil deficits and crop requirements:                 │
│     - Fertilizer type (e.g., DAP, Urea, CAN)                   │
│     - Application rate                                          │
│     - Timing                                                    │
│   Must be reviewed by agronomist before deployment to farmers   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AGROBUS MARKETPLACE                           │
│                                                                 │
│   Farmer connects recommendation to available inputs:           │
│     - Fertilizer suppliers                                      │
│     - Input prices                                              │
│     - Credit / loan eligibility                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Validation Gates

Each layer must be independently validated before deployment:

| Component              | Validation Required                              | Status        |
|------------------------|--------------------------------------------------|---------------|
| Soil Type Classifier   | Accuracy on Rwanda field samples                 | PENDING DATA  |
| Property Estimator     | RMSE vs actual lab values (held-out Rwanda data) | BLOCKED       |
| Agronomic Rules        | Review by Rwanda agronomist                      | NOT STARTED   |
| Crop Recommendations   | Field verification in Rwanda context             | NOT STARTED   |
| Fertilizer Rates       | RAB / MINAGRI guideline alignment                | NOT STARTED   |
| Marketplace Integration| End-to-end user testing                          | NOT STARTED   |

---

## 8. Phase 2.3 Data Gate — Summary

```
Phase 2.3 is COMPLETE only when ALL of the following are verified:

  [ ] >= 100 physical Rwanda soil samples collected per protocol
  [ ] >= 3 RGB photographs per sample, correctly named
  [ ] Accredited laboratory results for every sample
  [ ] sample_id links every image to its laboratory record (100% match)
  [ ] Required fields present for all records
  [ ] python dataset/phase2/validate_dataset.py returns PASS
  [ ] No invented or fabricated values anywhere in samples.csv
  [ ] QC report created at evaluation/phase2_quality_control_report.md

Until all boxes are checked, Phase 2.3 is BLOCKED.
Do NOT train a Phase 2 model on invented or proxy data.
```
