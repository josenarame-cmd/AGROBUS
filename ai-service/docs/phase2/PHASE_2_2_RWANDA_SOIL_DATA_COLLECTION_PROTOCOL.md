# PHASE 2.2 — RWANDA SOIL DATA COLLECTION PROTOCOL
> **Version:** 2.0 — Updated to align with the full Phase 2 Master Instruction.
> **Status:** COMPLETE — Awaiting real field data to trigger Phase 2.3.

## Objective
Establish a scientifically sound, standardized method for collecting authentic Rwandan soil
samples, capturing their visual representations, and pairing them with verified laboratory
measurements. Every piece of data that enters the AGROBUS Phase 2 ML pipeline must have a
clear, unbroken chain of custody.

---

## Golden Rule
```
ONE PHYSICAL SAMPLE
        ↓
ONE UNIQUE SAMPLE ID
        ↓
SOIL IMAGE(S)   +   LABORATORY MEASUREMENT(S)
```
No orphan images. No orphan laboratory records. No invented values.

---

## 2.2.1 Data Requirements

### Required (every sample must have these)

| Field               | Description                                                  |
|---------------------|--------------------------------------------------------------|
| `sample_id`         | Unique identifier, format `RW-SOIL-XXXX`                    |
| `image_id`          | Per-image ID linked back to sample_id                        |
| `district`          | Rwanda administrative district                               |
| `sector`            | Rwanda administrative sector                                 |
| `collection_date`   | ISO 8601 format: YYYY-MM-DD                                  |
| `depth_cm`          | Actual recorded depth range (e.g., `0-20`)                   |
| `collection_method` | e.g., auger, spade, composite                                |
| `laboratory`        | Full name of accredited laboratory                           |
| `measurement_date`  | Date laboratory analysis was completed                       |
| `measurement_method`| Documented method per property (e.g., Mehlich-3 for P/K)    |
| `ph`                | Minimum required soil property                               |

### Optional (record if available from the laboratory)

| Field                | Description                                         |
|----------------------|-----------------------------------------------------|
| `nitrogen_ppm`       | Total Nitrogen (mg/kg or ppm)                       |
| `phosphorus_ppm`     | Extractable Phosphorus (mg/kg or ppm)               |
| `potassium_ppm`      | Extractable Potassium (mg/kg or ppm)                |
| `organic_matter_pct` | Organic Matter (%)                                  |
| `moisture_pct`       | Gravimetric moisture (%)                            |
| `crop`               | Current or previous crop on the sampled plot        |

### Recommended for Future Research

| Field             | Description                                                  |
|-------------------|--------------------------------------------------------------|
| `latitude`        | GPS latitude (decimal degrees, WGS84)                        |
| `longitude`       | GPS longitude (decimal degrees, WGS84)                       |
| `elevation_m`     | Meters above sea level                                       |
| `season`          | Rwanda Season A / Season B / Season C                        |
| `weather_notes`   | Rainfall days before sampling, vegetation cover              |
| `soil_type_visual`| Field observer's initial soil-type estimate (optional label) |
| `detection_limit` | Lab-reported detection/quantification limit per property     |
| `analyst`         | Name or ID of the laboratory analyst responsible             |
| `lab_report_ref`  | Reference number of the laboratory report document           |
| `qc_flag`         | Quality control notes from the laboratory                    |

> **NOTE:** Fields marked "Recommended" will NOT be populated with invented values.
> If a field has no value, it must remain `null` in the CSV.

---

## 2.2.2 Sampling Strategy

**Geographic target:** Rwanda's distinct agro-ecological zones should be represented:

| Zone / Province    | Soil Characteristics                          | Priority |
|--------------------|-----------------------------------------------|----------|
| Eastern Province   | Drier, sandy/loamy, lower elevation           | High     |
| Northern Province  | Volcanic, high elevation, high rainfall       | High     |
| Western Province   | Steep slopes, erosion risk, clay-rich         | High     |
| Southern Province  | Mixed clay-sandy, banana/tea corridor         | Medium   |
| Kigali area        | Urban fringe, mixed anthropogenic disturbance | Low      |

**Minimum recommended sampling for a prototype:** 30-50 samples per high-priority zone.

> **IMPORTANT — Scope disclaimer:**
> This initial dataset is a research prototype covering selected Rwandan agricultural zones.
> It does not represent all of Rwanda's soil variability and must not be described as a
> nationally representative soil survey.

---

## 2.2.3 Sample Collection Procedure

1. **Identification:** Pre-generate Sample IDs (`RW-SOIL-0001` onward) on waterproof labels and
   data sheets before field work begins.
2. **Location:** Record District, Sector, and GPS coordinates. Flag if GPS is unavailable.
3. **Clear debris:** Remove surface residues (leaves, stones, crop debris) from a 30cm x 30cm
   area before sampling.
4. **Sampling depth:** Insert auger or spade to collect a clean V-shaped core of **0-20 cm**
   for topsoil. If the laboratory requires a different depth, record the actual depth used.
5. **Contamination prevention:** Use clean, stainless steel or plastic tools. Rinse tools between
   samples. Do not touch the sample with bare hands.
6. **Photograph first:** Conduct image collection (see 2.2.4) BEFORE sealing the container,
   while the soil is in its natural collected state.
7. **Homogenization:** Mix the sample in the bag. Remove stones larger than 2 cm.
8. **Storage:** Seal in a labelled airtight zip-lock bag. Store in a cool box away from direct
   sunlight. If ambient temperature exceeds 30 degrees C, use ice packs.
9. **Chain of custody form:** Complete a chain of custody document linking Sample ID to the
   field collector, date, time, and storage method.
10. **Laboratory submission:** Submit to an accredited laboratory within 48 hours. The Sample ID
    MUST appear on the submission form and on the final laboratory output report.

---

## 2.2.4 Image Collection Protocol

**Equipment:** Any smartphone camera with 12 MP resolution or higher.
**Background:** Matte white or grey plastic tray (A4 paper size minimum), placed flat and stable.

### Procedure (per sample, before sealing the bag)

1. Spread a thin, even layer of the collected soil on the tray.
2. Place the tray in natural, diffuse daylight (outdoor shade or near an open door).
3. Hold the smartphone directly above the tray at approximately 30 cm, camera pointing straight
   down at 90 degrees.
4. Confirm the camera is focused before capturing.
5. Capture a minimum of 3 images per sample. Minor repositioning between shots is acceptable.

### File Naming Convention

```
[SAMPLE_ID]_[TWO_DIGIT_IMG_INDEX].jpg

Example:
  RW-SOIL-0001_01.jpg
  RW-SOIL-0001_02.jpg
  RW-SOIL-0001_03.jpg
```

All images from one physical sample MUST remain in the same train/validation/test split.
Never split images from the same physical sample across different dataset splits.

### Additional Recording Required Per Image

| Field                | Record                                                    |
|----------------------|-----------------------------------------------------------|
| `device_model`       | e.g., Samsung Galaxy A54                                  |
| `image_resolution`   | e.g., 4000 x 3000 px                                      |
| `lighting_condition` | Natural daylight / Overcast / Indoor LED                  |
| `image_date`         | YYYY-MM-DD                                                |
| `notes`              | Any unusual conditions during image capture               |

---

## 2.2.5 Laboratory Ground Truth

**Priority soil properties** (confirm availability with the laboratory before fieldwork):

| Property       | Preferred Method             | Unit         | Priority |
|----------------|------------------------------|--------------|----------|
| pH             | Potentiometry in H2O 1:5     | dimensionless| Required |
| Organic Matter | Loss on ignition / Walkley-Black | %        | Required |
| Phosphorus     | Mehlich-3 or Olsen           | mg/kg (ppm)  | Required |
| Potassium      | Mehlich-3 or ammonium acetate| mg/kg (ppm)  | Required |
| Nitrogen       | Kjeldahl method              | %            | Optional |
| Moisture       | Gravimetric                  | %            | Optional |

**Mandatory entries for every laboratory measurement record:**

```
sample_id
property (e.g., ph, phosphorus_ppm)
value
unit
detection_limit
laboratory_name
method
measurement_date
analyst_id (if available)
lab_report_reference
```

If a measurement is below the laboratory's detection limit, record it as
`< [detection_limit_value]`. Do NOT record it as zero or leave it blank without a note.

---

## 2.2.6 Master Metadata Schema

Master dataset maintained as: `ai-service/dataset/phase2/metadata/samples.csv`

```csv
sample_id, image_id, district, sector, latitude, longitude, elevation_m,
collection_date, season, depth_cm, collection_method, crop, soil_type_visual,
ph, nitrogen_pct, phosphorus_ppm, potassium_ppm, organic_matter_pct,
moisture_pct, laboratory, measurement_method, measurement_date,
detection_limit_notes, analyst, lab_report_ref, device_model,
image_resolution, lighting_condition, image_date, image_path, qc_status, notes
```

**Rules:**
- Empty fields MUST be `null` — never imputed, guessed, or fabricated.
- `qc_status` values: `PENDING`, `ACCEPTED`, `QUARANTINED`, `REJECTED`.
- One row per image. Multiple rows share the same `sample_id` for multi-image samples.

---

## 2.2.7 Quality-Control Rejection Rules

Records are moved to `quarantine/` (NOT permanently deleted) with a documented reason if:

| Rejection Criterion                              | Action     |
|--------------------------------------------------|------------|
| Missing `sample_id`                              | QUARANTINE |
| `sample_id` not matching image AND lab record    | QUARANTINE |
| Corrupted or unreadable image file               | QUARANTINE |
| Severe blur or more than 50% occlusion by shadow | QUARANTINE |
| Image file name does not follow protocol         | FLAG       |
| Laboratory result missing `sample_id`            | QUARANTINE |
| Missing measurement units                        | QUARANTINE |
| Scientifically impossible value (e.g., pH < 2)   | QUARANTINE |
| Duplicate `sample_id` in dataset                 | QUARANTINE |
| Duplicate image hash across samples              | QUARANTINE |
| No laboratory report reference number            | FLAG       |
| Documented sample contamination                  | QUARANTINE |

All quarantine reasons must be recorded in `evaluation/phase2_quality_control_report.md`.

---

## 2.2.8 Ethical and Privacy Considerations

1. **Informed consent:** Written or witnessed verbal consent must be obtained from every farmer
   before sampling their land. Consent forms must be retained in the project records.
2. **Data minimization:** Do not collect personal farmer information beyond what is required for
   soil analysis. Do not collect names unless explicitly needed and consented to.
3. **Location privacy:** GPS coordinates will be spatially jittered (plus or minus 100 m) in any
   public dataset or publication to prevent exact homestead identification.
4. **Data ownership:** AGROBUS stores prototype data exclusively for building agronomic advisory
   tools. Soil data will not be sold to third-party input suppliers or commercial aggregators.
5. **Research transparency:** Farmers must be clearly informed that their samples will be used
   to train an AI system. The purpose, data usage, and retention period must be communicated
   before consent is requested.
6. **Data sharing:** Any external sharing must comply with the original consent scope. Published
   datasets must carry a clearly documented open data license.
7. **Benefit return:** Where practical, share soil analysis results back to participating farmers
   as a form of reciprocal value and trust building.

---

## 2.2.9 Phase 2.2 Completion Gate

| Requirement                                    | Status      |
|------------------------------------------------|-------------|
| Sampling strategy defined                      | COMPLETE    |
| Sample collection procedure defined            | COMPLETE    |
| Image collection procedure defined             | COMPLETE    |
| Laboratory measurement requirements defined    | COMPLETE    |
| Sample ID system defined                       | COMPLETE    |
| Image-to-sample linking defined                | COMPLETE    |
| Metadata schema defined                        | COMPLETE    |
| Quality-control rules defined                  | COMPLETE    |
| Privacy/consent considerations documented      | COMPLETE    |
| Protocol document created                      | COMPLETE    |

**PHASE 2.2 STATUS: COMPLETE**

---

## Next Required Action (Phase 2.3 Gate)

> **DATA NOT AVAILABLE — FIELD COLLECTION REQUIRED**
>
> Phase 2.3 (Data Collection and Laboratory Ground Truth) cannot begin until real
> Rwandan soil samples have been physically collected, photographed following this protocol,
> and submitted to an accredited laboratory for analysis.
>
> Required before Phase 2.3:
> - Physical soil samples collected in Rwanda
> - Images captured per protocol (Section 2.2.4)
> - Accredited laboratory analysis completed
> - Sample IDs verified across images and lab results
> - Metadata CSV populated with real values
