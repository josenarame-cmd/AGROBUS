# PHASE 2A: FIELD COLLECTION GUIDE

## Preparation
- Data collection forms (offline or digital via CSV/Excel mapping).
- GPS device / Smartphone.
- Sample bags with readable labels.
- Camera / Smartphone for images.

## On-Site Steps
1. **Clear area**: Clear surface residue or debris.
2. **Collect physical sample**: Gather sample from the target soil depth (e.g., 0-20 cm).
3. **Bag & Label it**: Seal bag and affix labels, including the predefined Sample ID (`RW-[DISTRICT]-####`).
4. **Take photos**:
    - Spread a portion of the soil in a consistent manner.
    - Avoid heavy direct sunlight casting odd shadows.
    - Take 3 to 5 images focusing on texture, surface condition, and general makeup. Name files using `SampleID_01.jpg`, etc.
5. **Log Contextual Metadata**: Look around and log slope, drainage, crop specifics, weather condition. Take exact GPS coordinates.
6. **Finalize**: Note down if physical sample has indeed been securely stored for an eventual laboratory trip.

## Post-Collection Check
Run the validator script `validate_phase2a_dataset.py` located in `dataset/phase2a/` to ensure everything conforms correctly before declaring the collection a success.
