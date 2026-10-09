# PHASE 2.3 — RWANDA FIELD COLLECTION WORKFLOW
> **Status:** READY — Waiting for field team deployment and funding confirmation
> **Purpose:** Practical workflow for AGROBUS soil data collectors in Rwanda
> **Use alongside:** `PHASE_2_3_FIELD_COLLECTION_CHECKLIST.md` (per-sample print sheet)

---

## Overview

This workflow defines the complete, end-to-end process for collecting Rwanda
soil data for Phase 2. Every step must be completed in order. No step may
be skipped.

The output of this workflow is a validated, complete dataset entry in:
`dataset/phase2/metadata/samples.csv`
and matching images in:
`dataset/phase2/raw/images/`

---

## STEP 1 — Identify Sampling Location

**Before entering the field:**

1. Identify target agro-ecological zones for Rwanda:
   - Eastern Province (Kayonza, Kirehe, Ngoma — typical dryland farming zones)
   - Northern Province (Musanze, Burera — higher altitude, volcanic soils)
   - Southern Province (Nyanza, Huye — mixed farming)
   - Western Province (Rusizi, Nyamasheke — tea/coffee soil contexts)

2. Consult with local agronomists or extension officers to confirm:
   - Access permission from landowner/farmer
   - Whether plot has been recently fertilized (record if so — affects results)
   - Whether plot is representative of the zone or an outlier

3. Record the planned sampling location in advance:
   - District name (official Rwanda administrative name)
   - Sector name
   - Approximate GPS area

> **Rule:** Do not sample the same plot twice and treat as independent samples.

---

## STEP 2 — Assign Sample ID

**Before physically touching the soil:**

1. Generate the Sample ID from the pre-printed batch:
   ```
   Format: RW-SOIL-XXXX
   Example: RW-SOIL-0001
   ```
2. Write the Sample ID on the zip-lock bag label **before** opening the bag.
3. Write the Sample ID on the data sheet **before** collecting soil.
4. Note the Sample ID in the digital record (smartphone app or spreadsheet).

> **Rule:** One physical sample = one unique Sample ID.
>           Never reuse a Sample ID even if a sample is discarded.

---

## STEP 3 — Record District / Sector / Location

At the sampling site (GPS device or smartphone):

| Field              | How to collect                                 |
|--------------------|------------------------------------------------|
| `district`         | Official Rwanda district name — confirm on map |
| `sector`           | Rwanda sector name                             |
| `latitude`         | GPS reading — decimal degrees (WGS84)          |
| `longitude`        | GPS reading — decimal degrees (WGS84)          |
| `elevation_m`      | GPS reading if available; otherwise leave blank |
| `collection_date`  | Today's date — format: YYYY-MM-DD              |
| `season`           | Rwanda Season A (Sep–Feb), B (Mar–May), C (Jun–Aug) |
| `crop`             | Current or most recent crop on the plot        |

If GPS is unavailable:
- Record reason in `notes` field
- Collect district and sector from local administration knowledge
- Attempt GPS location from return location matching later

> **Privacy rule:** GPS coordinates must be jittered (±50m) before any
> public data release to protect individual farmers' plot locations.

---

## STEP 4 — Record Actual Soil Depth

At the sampling site:

1. Decide sampling depth based on agronomic objective:
   - Topsoil: 0–20 cm (standard for crop nutrition assessment)
   - Subsoil: 20–40 cm (for deeper root systems)

2. Record the **actual** depth collected, not an assumed value.
   ```
   Example: depth_cm = "0-20"
   Example: depth_cm = "0-15"  (if rock prevented deeper sampling)
   ```

> **Rule:** Do NOT write "0-20" if you could not sample to 20 cm.
>           Record the actual depth reached.

---

## STEP 5 — Collect Physical Sample

Equipment: Clean auger or spade, clean zip-lock bag, clean trowel.

1. Clear surface debris from a 30cm × 30cm area (leaves, stems, stones > 2cm).
2. Collect soil to the recorded depth using a clean auger or spade.
3. Remove stones larger than 2cm by hand.
4. Place soil into the pre-labelled zip-lock bag.
5. **Do NOT seal the bag yet** — photography must be completed first (Step 6).

Clean equipment between every sample (rinse with clean water, allow to air dry
or wipe dry). Contamination from previous sample will corrupt results.

---

## STEP 6 — Photograph the Sample

This step produces the RGB training images for the AI model.

**Equipment:** Smartphone with camera, matte white or light grey tray.

**Protocol (must be followed exactly — deviation reduces model quality):**

1. Spread the soil sample evenly on the matte white/grey tray.
   - Depth of soil layer: approximately 1–2 cm.
   - Remove any obvious stones or plant material visible on the surface.

2. Place the tray in **natural diffuse light** (open shade, not direct sunlight).
   - Avoid: Direct sun (harsh shadows, color shift).
   - Avoid: Indoor artificial light (color cast).
   - Preferred: Overcast sky or shaded outdoor area.

3. Hold the smartphone **directly above the tray at 90 degrees** (straight down).
   - Height: approximately 30 cm above the tray surface.
   - Camera must be focused and stable before capture.

4. Capture 3 images per sample:

   | Image # | Filename format          | Notes                      |
   |---------|--------------------------|----------------------------|
   | 1       | `RW-SOIL-XXXX-01.jpg`    | Standard position          |
   | 2       | `RW-SOIL-XXXX-02.jpg`    | Slightly different angle (approx 5° tilt allowed) |
   | 3       | `RW-SOIL-XXXX-03.jpg`    | After gentle soil break-up to expose fresh surface |

5. Check images on screen:
   - All 3 images are in focus
   - Tray is fully in frame
   - No strong shadows over the soil

6. Record for each session:
   - `device_model`: Full smartphone model (e.g., "Samsung Galaxy A53")
   - `lighting_condition`: "natural daylight" / "overcast" / "indoor"
   - `image_date`: Date of capture (YYYY-MM-DD)

> **Rule:** Do NOT photograph wet or saturated soil and label it as dry.
>           Record actual soil moisture condition in `notes`.

---

## STEP 7 — Record Device and Image Metadata

After photography, immediately record:

```
sample_id:          RW-SOIL-____
image_id (01):      RW-SOIL-____-01
image_id (02):      RW-SOIL-____-02
image_id (03):      RW-SOIL-____-03
device_model:       ___________________
image_resolution:   (check camera settings — e.g., "12MP" or "4032x3024")
lighting_condition: natural daylight / overcast / indoor
image_date:         YYYY-MM-DD
notes:              Any unusual condition (wet soil, unusual colour, etc.)
```

Back up images to a second device or cloud storage **before the end of the day**.

---

## STEP 8 — Preserve Sample

After photography:

1. Seal the zip-lock bag with the soil sample inside.
2. Verify the Sample ID label is clearly visible.
3. Store in a cool box / cool environment away from direct sunlight.
4. Complete the chain of custody form for this sample.

Do not allow samples to:
- Dry out completely before reaching the laboratory
- Get wet from rain or condensation
- Mix with other samples
- Remain unrefrigerated for more than 48 hours before laboratory submission

---

## STEP 9 — Send Sample to Laboratory

Within 48 hours of collection:

1. Package all samples from the collection batch.
2. Attach a submission form listing each Sample ID.
3. Deliver to the chosen accredited laboratory.
   - Confirm the laboratory can analyze: pH, Organic Matter
   - Confirm if Phosphorus and Potassium analysis is available
   - Record the expected return date

4. Obtain and record the laboratory reference number.
5. Record for the batch:
   ```
   laboratory:       Full name of the laboratory
   submission_date:  YYYY-MM-DD
   lab_reference:    Laboratory batch reference number
   expected_return:  YYYY-MM-DD
   ```

---

## STEP 10 — Record Laboratory Result

When laboratory results arrive:

1. Match every result to its Sample ID.
   - Every Sample ID in the lab report must match a physical sample.
   - Every physical sample must have a result — follow up on any missing.

2. For each property measured, record:
   ```
   property:           ph, organic_matter_pct, phosphorus_ppm, potassium_ppm, etc.
   value:              Numeric value from lab report
   unit:               As stated in lab report (e.g., %, ppm, cmol/kg)
   measurement_method: Analytical method used (e.g., "Walkley-Black", "Mehlich-3")
   measurement_date:   Date analysis completed (YYYY-MM-DD)
   lab_report_ref:     Laboratory report reference number
   detection_limit:    If stated in the lab report
   ```

3. Do NOT:
   - Guess or estimate missing values
   - Use iSDAsoil or any predicted map values as laboratory results
   - Use values from a different sample for a different sample_id
   - Average values from multiple samples into one record

---

## STEP 11 — Link Laboratory Result to Sample ID

In `dataset/phase2/metadata/samples.csv`:

1. Locate the existing row(s) for this `sample_id` (image rows).
2. Add the laboratory values to each row for this sample.
   OR add a separate lab-only row referencing the same `sample_id`.
3. Verify that `sample_id` in `samples.csv` matches `sample_id` in the lab report exactly.
4. Update `qc_status` from `PENDING` to `ACCEPTED` if all required fields are present.

> **If a lab value is missing:** Set `qc_status = QUARANTINED` and note the
> reason. Do not invent the missing value.

---

## STEP 12 — Run Dataset Validation

From the `ai-service` directory:

```bash
python dataset/phase2/validate_dataset.py
```

Or with custom paths:
```bash
python dataset/phase2/validate_dataset.py \
    --csv dataset/phase2/metadata/samples.csv \
    --images dataset/phase2/raw/images/ \
    --lab dataset/phase2/raw/laboratory/
```

**Read the report carefully:**
- ALL `[FAIL]` items must be resolved before proceeding.
- `[WARN]` items should be reviewed — some may block model training.
- `[PASS]` items confirm that check is satisfied.

Do NOT proceed to Phase 2.4 if the validator reports `RESULT: FAIL`.

---

## STEP 13 — Move Valid Data into the Phase 2 Dataset

Once the validator returns `RESULT: PASS` or `RESULT: PASS WITH WARNINGS`
(with warnings reviewed and accepted):

1. Move images from staging to:
   `dataset/phase2/raw/images/`

2. Move laboratory CSV exports to:
   `dataset/phase2/raw/laboratory/`

3. Confirm `samples.csv` is fully populated and saved.

4. Create the quality control report:
   `evaluation/phase2_quality_control_report.md`
   (document which records passed, which were quarantined, and why)

5. Notify the AI team that Phase 2.4 can begin.

---

## Quality Flag Reference

| QC Status     | Meaning                                              |
|---------------|------------------------------------------------------|
| `PENDING`     | Images collected — awaiting laboratory results       |
| `ACCEPTED`    | All required fields present — ready for training     |
| `QUARANTINED` | QC issue identified — do NOT use for training        |
| `REJECTED`    | Permanently excluded — documented reason required    |

---

## What NOT to Do

| Prohibited Action                                         | Reason                                      |
|-----------------------------------------------------------|---------------------------------------------|
| Invent or estimate laboratory values                      | Fabrication — corrupts model training       |
| Use iSDAsoil / SoilGrids values as lab ground truth       | Predicted maps ≠ laboratory measurements    |
| Use Kaggle soil dataset as Rwanda training data           | Not Rwanda, no lab measurements             |
| Re-photograph a stored (dried or wetted) sample and label it fresh | Conditions no longer match collection state |
| Submit the same sample twice under different Sample IDs   | Duplicate data — causes leakage             |
| Skip the validator and proceed to Phase 2.4               | Unvalidated data will corrupt model         |
