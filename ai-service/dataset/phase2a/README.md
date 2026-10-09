# AGROBUS Phase 2A Dataset: Rwanda Soil Image Collection

This dataset contains field-collected soil images and metadata from Rwanda, intended for future linkage with laboratory ground-truth measurements.

## ⚠️ IMPORTANT LIMITATIONS
- **This is a Rwanda field-image collection initiative.**
- **It is NOT yet a laboratory-validated soil-property dataset.**
- There is NO laboratory ground truth for pH, NPK, organic matter, moisture, or fertility in this phase.
- Do NOT use this dataset to train predictive models for chemical properties.
- Do NOT generate fake or assumed laboratory values.

## Purpose
The objective of Phase 2A is to build a robust data collection pipeline:
1. Collect standardized soil images in the field (starting with Karongi District, Rwanda).
2. Gather rich contextual metadata (location, weather, crop info).
3. Ensure physical soil samples are preserved for future lab testing.
4. Establish unique identifiers (`Sample ID`) to link photographs, metadata, and future lab results without breaking dataset structures.

## Directory Structure
```
dataset/phase2a/
├── raw/                # Unprocessed RGB images directly from the field
├── metadata/           # CSV files (e.g., samples.csv) containing field data
├── validated/          # Data that has passed quality control
├── quarantine/         # Data that failed validation (missing info, bad images)
└── README.md           # This file
```

## Collection Area
Current focus: **Karongi District, Rwanda**
*(Note: Karongi does not represent all of Rwanda; further districts will be added in subsequent phases.)*

## Sample ID Format
`RW-[DISTRICT CODE]-[NUMBER]`
Example: `RW-KAR-0001`
This exact ID must be used on the physical sample bag, the metadata record, and the image filenames.

## Image Naming Convention
Images MUST be named using the Sample ID followed by an index.
Example for sample `RW-KAR-0001`:
- `RW-KAR-0001_01.jpg`
- `RW-KAR-0001_02.jpg`
- `RW-KAR-0001_03.jpg`

## Metadata Fields
See `dataset/phase2a/metadata/samples.csv` for the exact schema. Required fields are enforced by the validator. All fields concerning laboratory data must remain empty (`NOT_TESTED`, etc.) until real laboratory data is acquired.

## Quality Control (QC) Rules
- Minimum recommended images per sample is 3.
- A sample must have an existing metadata record and at least one image file.
- The `physical_sample_available` field must track whether the soil itself is retained for the lab.
- **Data Leakage Prevention**: Images from the same physical soil sample must NEVER be split; all `*_01.jpg`, `*_02.jpg`, etc., belonging to a single Sample ID must route to the same partition (Train, Val, or Test).

## Privacy Rules
- Do not collect farmer names, phone numbers, or identity details.
- For public releases, GPS coordinates may be generalized/jittered.

## Future Laboratory Integration
When laboratory data becomes available (Phase 2B), the fields `laboratory_status`, `laboratory_sample_id`, and other chemical properties will be updated. The `sample_id` is the primary key linking the photos to the lab results.
