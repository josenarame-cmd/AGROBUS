# PHASE 2A: RWANDA SOIL IMAGE COLLECTION

## Objective
To build the Rwanda Soil Image Dataset Collection Pipeline for AGROBUS. This pipeline captures high-quality soil field images in standardized formats along with environmental contextual metadata, and crucially preserves the physical sample linkage so that future laboratory analyses can be linked directly back to specific images without ambiguity.

## Target Area
Initial focus: **Karongi District, Rwanda** (This allows proving the pipeline locally before expanding).

## Workflow
1. Field site identified.
2. Soil sample collected (and physically retained).
3. Sample ID generated (`RW-KAR-XXXX`).
4. Minimum 3 high-quality photographs captured.
5. Location (GPS), date, crop, weather context logged into metadata form.
6. Data uploaded to pipeline (`ai-service/dataset/phase2a/`).
7. Quality checks enforce schema compliance and unique references.
8. Retained physical sample logged as available for Phase 2B (Laboratory integration).

## Important Project Rules
- **No data fabrication**: We must not claim or estimate laboratory values (pH, NPK, etc.) during this phase. AI output remains labelled strictly as "Estimated Visual Soil Type".
- **Data Leakage**: Do not split images belonging to the same `Sample ID` across training/validation sets.
- **Privacy**: No unneeded personal data; GPS coordinates subject to jittering upon public release.
