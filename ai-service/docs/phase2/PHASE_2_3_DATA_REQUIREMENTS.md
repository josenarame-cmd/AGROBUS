# PHASE 2.3 — DATA REQUIREMENTS SPECIFICATION
> **Purpose:** Formal specification of data requirements for Phase 2 model development.
> **Rule:** No Phase 2 model will be trained until all REQUIRED fields are available
> for a sufficient number of samples.

---

## Summary

| Category          | Requirement                                    | Status      |
|-------------------|------------------------------------------------|-------------|
| Physical samples  | >= 100 samples with lab results                | NOT MET     |
| RGB images        | >= 3 per sample, per protocol                  | NOT MET     |
| Lab measurements  | pH + Organic Matter for every sample           | NOT MET     |
| Sample ID linking | 100% — image to lab result                     | NOT MET     |
| Location data     | District + sector for every sample             | NOT MET     |
| Quality control   | Validator must pass on dataset                 | NOT MET     |

**Overall Status: DATA NOT AVAILABLE — Phase 2.3 BLOCKED**

---

## 1. Required Fields — Image Records

Every row in `samples.csv` representing an image must contain:

| Field              | Type      | Validation Rule                                         |
|--------------------|-----------|---------------------------------------------------------|
| `sample_id`        | string    | Format `RW-SOIL-XXXX`, unique per physical sample       |
| `image_id`         | string    | Format `RW-SOIL-XXXX-YY`, unique across all images      |
| `image_path`       | string    | File must exist at this path                            |
| `district`         | string    | Must match a known Rwanda district name                 |
| `sector`           | string    | Non-empty                                               |
| `collection_date`  | date      | Valid ISO 8601 date (YYYY-MM-DD)                        |
| `depth_cm`         | string    | Non-empty (e.g., "0-20")                                |
| `collection_method`| string    | One of: auger, spade, composite                         |
| `laboratory`       | string    | Non-empty                                               |
| `measurement_date` | date      | Valid date, after collection_date                       |
| `measurement_method`| string   | Non-empty                                               |
| `ph`               | float     | Range: 2.0 - 12.0                                       |
| `device_model`     | string    | Non-empty                                               |
| `lighting_condition`| string   | Non-empty                                               |
| `qc_status`        | string    | One of: PENDING, ACCEPTED, QUARANTINED, REJECTED        |

---

## 2. Required Fields — Laboratory Records

Every soil sample must have a matching laboratory record containing:

| Field              | Type      | Validation Rule                                         |
|--------------------|-----------|---------------------------------------------------------|
| `sample_id`        | string    | Must match an image record sample_id                    |
| `ph`               | float     | Range: 2.0 - 12.0                                       |
| `organic_matter_pct`| float    | Range: 0.0 - 100.0                                      |
| `laboratory`       | string    | Non-empty accredited lab name                           |
| `measurement_method`| string   | Non-empty                                               |
| `measurement_date` | date      | Valid ISO date                                          |
| `lab_report_ref`   | string    | Non-empty reference number                              |

---

## 3. Recommended Fields — Additional Laboratory Properties

Collect if the laboratory supports them. NOT required to pass the Phase 2.3 gate,
but required for N/P/K prediction capability in later phases.

| Field              | Type      | Validation Rule                                         |
|--------------------|-----------|---------------------------------------------------------|
| `phosphorus_ppm`   | float     | Range: 0.0 - 2000.0                                     |
| `potassium_ppm`    | float     | Range: 0.0 - 10000.0                                    |
| `nitrogen_pct`     | float     | Range: 0.0 - 10.0                                       |
| `moisture_pct`     | float     | Range: 0.0 - 100.0                                      |

---

## 4. Recommended Fields — Location Context

These fields will be used for the location-aware model (Model B).
Strongly recommended but not required to unblock Phase 2.3.

| Field        | Type    | Notes                                            |
|--------------|---------|--------------------------------------------------|
| `latitude`   | float   | WGS84 decimal degrees                            |
| `longitude`  | float   | WGS84 decimal degrees                            |
| `elevation_m`| integer | Can be derived from coordinates post-collection  |
| `season`     | string  | Season A / B / C                                 |
| `crop`       | string  | Current or previous crop                         |

---

## 5. Explicitly Forbidden Data

The following MUST NEVER appear in `samples.csv`:

| Forbidden Entry                               | Reason                                 |
|-----------------------------------------------|----------------------------------------|
| Invented pH values                            | Fabricated ground truth                |
| Invented NPK values                           | Fabricated ground truth                |
| iSDAsoil predicted values used as lab results | Predicted maps are not lab measurements|
| Kaggle dataset soil class used as pH proxy    | Color label is not a measurement       |
| Interpolated/imputed lab values               | Not real data                          |
| Duplicate sample IDs with different images    | Indicates data error or fabrication    |

---

## 6. What Happens If Fields Are Missing

| Missing Field            | Action                                             |
|--------------------------|----------------------------------------------------|
| `sample_id`              | Record QUARANTINED — cannot be used                |
| `image_path` (file gone) | Record QUARANTINED — image must be re-found        |
| `ph`                     | Record QUARANTINED — cannot train pH model         |
| `organic_matter_pct`     | Record flagged — OM model cannot use this sample   |
| `district`               | Record flagged — location model cannot use sample  |
| `latitude` / `longitude` | Record flagged — geographic model cannot use sample|
| `lab_report_ref`         | Record flagged — traceability incomplete           |
| Non-required field       | Record may still be used for supported properties  |

---

## 7. Phase 2.3 Gate Condition

Phase 2.3 is COMPLETE when ALL of the following are true:

```
[ ] >= 100 physical samples collected per protocol
[ ] >= 3 RGB images per sample, named correctly
[ ] Accredited laboratory results received for each sample
[ ] sample_id links image record to lab record — 100% match
[ ] Required fields present: sample_id, district, sector, date, depth,
    lab name, lab method, pH, organic_matter_pct, lab_report_ref
[ ] python dataset/phase2/validate_dataset.py returns PASS
[ ] No invented or fabricated values in samples.csv
[ ] QC report created at evaluation/phase2_quality_control_report.md
```

Until all boxes are checked, Phase 2.3 remains BLOCKED.
