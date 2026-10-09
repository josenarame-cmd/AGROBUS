# PHASE 2.3 — FIELD COLLECTION CHECKLIST
> **Purpose:** Step-by-step field collection checklist for AGROBUS soil data collectors.
> **Print and carry to the field — one page per sample.**

---

## Before Leaving for the Field

- [ ] Sample ID labels prepared (waterproof, permanent marker)
- [ ] Data collection sheets printed (one per sample)
- [ ] GPS device or smartphone with GPS app ready
- [ ] Auger or clean spade available
- [ ] Clean zip-lock bags (labelled batch)
- [ ] Matte white/grey tray for photography
- [ ] Smartphone charged (> 80%)
- [ ] Ice box / cool bag for sample storage
- [ ] Chain of custody forms
- [ ] Contact for receiving laboratory confirmed

---

## Per-Sample Checklist

### STEP 1 — Pre-assign Sample ID

- [ ] Sample ID assigned: `RW-SOIL-____`
- [ ] Label affixed to zip-lock bag before opening

---

### STEP 2 — Record Location

- [ ] District: ________________________
- [ ] Sector: _________________________
- [ ] GPS Latitude: ___________________
- [ ] GPS Longitude: __________________
- [ ] Elevation (if readable): _________ m
- [ ] Collection Date: ________________ (YYYY-MM-DD)
- [ ] Season: [ ] Season A  [ ] Season B  [ ] Season C
- [ ] Current / Previous Crop: _________________
- [ ] GPS unavailable? [ ] Yes — note reason: ________________

---

### STEP 3 — Site Preparation

- [ ] Surface debris cleared (leaves, stones, crop residue)
- [ ] Area: 30cm x 30cm cleared
- [ ] No visible fertilizer application in area? [ ] Confirmed
- [ ] Tools are clean (rinsed from previous sample)

---

### STEP 4 — Sample Collection

- [ ] Sampling depth: ________ cm (record ACTUAL depth, do not assume)
- [ ] Collection method: [ ] Auger  [ ] Spade  [ ] Composite
- [ ] Sample collected into clean zip-lock bag
- [ ] Stones > 2cm removed
- [ ] Bag sealed after photography (see Step 5)

---

### STEP 5 — Image Collection (BEFORE sealing bag)

- [ ] Soil spread evenly on white/grey tray
- [ ] Tray placed in natural diffuse light (shade, not direct sun)
- [ ] Smartphone held at 30cm directly above tray (90-degree angle)
- [ ] Camera focused before capture
- [ ] Image 1 captured: `RW-SOIL-____-01.jpg` [ ]
- [ ] Image 2 captured: `RW-SOIL-____-02.jpg` [ ]
- [ ] Image 3 captured: `RW-SOIL-____-03.jpg` [ ]
- [ ] Device model recorded: _________________________
- [ ] Lighting condition: [ ] Natural daylight  [ ] Overcast  [ ] Indoor
- [ ] Any unusual image conditions noted? ________________________

---

### STEP 6 — Sample Preservation

- [ ] Bag sealed and labelled with Sample ID
- [ ] Stored in cool box / away from direct sunlight
- [ ] Chain of custody form completed for this sample

---

### STEP 7 — End of Field Day

- [ ] All sample IDs accounted for
- [ ] Images backed up to secondary device / cloud
- [ ] Data sheets secured
- [ ] Samples stored in cool environment
- [ ] Laboratory submission planned within 48 hours

---

### STEP 8 — Laboratory Submission

- [ ] All samples submitted to: _________________________ (laboratory name)
- [ ] Submission form includes Sample IDs (one per sample)
- [ ] Laboratory confirms: pH analysis available
- [ ] Laboratory confirms: Organic Matter analysis available
- [ ] Laboratory confirms: P and K analysis available (if possible)
- [ ] Expected return date noted: ________________
- [ ] Laboratory reference number recorded: ________________

---

### STEP 9 — When Lab Results Arrive

- [ ] Lab results cross-checked against Sample IDs
- [ ] Every Sample ID in the lab report matches a physical sample
- [ ] Units documented for every measurement
- [ ] Analytical method recorded per property
- [ ] Lab report reference number recorded
- [ ] Results entered into `dataset/phase2/metadata/samples.csv`
- [ ] Run dataset validator: `python dataset/phase2/validate_dataset.py`
- [ ] Validator passes? [ ] YES — proceed to Phase 2.4
                        [ ] NO  — resolve issues before proceeding

---

## Quality Flag Legend

| Flag | Meaning                                    |
|------|--------------------------------------------|
| ACCEPTED    | Record passes all quality checks     |
| PENDING     | Record awaiting laboratory result    |
| QUARANTINED | Record has a QC issue — do not use   |
| REJECTED    | Record permanently excluded          |
