# PHASE 2A: DATA STANDARD

## 1. Identifiers
- Format: `RW-[DISTRICT_CODE]-[4_DIGIT_NUMBER]` (e.g., `RW-KAR-0001` for Karongi).
- Must be globally unique across all phases.

## 2. Image Standards
- **Quantity**: 3 - 5 images per sample.
- **Naming**: `[Sample_ID]_[Sequence_Number].jpg` (e.g., `RW-KAR-0001_01.jpg`).
- **Capture Rules**: Include texture variations, natural diffuse lighting where possible. Note the device and lighting conditions in metadata.
- **Prohibited Actions**: No heavy post-processing, filtering, color artificially altering.

## 3. Metadata Standards
Schema provided in `dataset/phase2a/metadata/samples.csv`. Field observations include current crop, elevation, GPS.
**Laboratory Fields**: Must be explicitly clear they are missing until a lab run is provided (e.g. `laboratory_status = NOT_TESTED`).

## 4. Partitions & Leakage Restrictions
Random splitting for train/test must occur at the **Sample ID** level, NEVER at the image count level.
All `RW-KAR-0001_*.jpg` files must end up in the exact same dataset partition.

## 5. Location-Awareness Validation
Future AI modeling will compare Baseline Models against models supplemented by locational context to determine whether the contextual metadata genuinely improves prediction or merely induces geographic leakage.
