import csv
from pathlib import Path

def render_dashboard(dataset_dir="dataset/phase2a"):
    base_path = Path(dataset_dir)
    metadata_path = base_path / 'metadata' / 'samples.csv'

    print("====================================")
    print(" AGROBUS PHASE 2A DATA DASHBOARD ")
    print("====================================")

    if not metadata_path.exists():
        print("Dataset metadata not found.")
        return

    total_samples = 0
    validated_samples = 0
    quarantined_samples = 0
    ready_for_lab = 0
    lab_results_rec = 0
    ready_for_ai = 0

    warn_missing_gps = 0
    warn_missing_depth = 0
    warn_missing_physical = 0

    with open(metadata_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_samples += 1

            status = row.get('sample_status', 'DRAFT')
            if status == 'VALIDATED':
                validated_samples += 1
            elif status == 'QUARANTINED':
                quarantined_samples += 1
            elif status == 'READY_FOR_LAB':
                ready_for_lab += 1
            elif status == 'LAB_RESULT_RECEIVED':
                lab_results_rec += 1
            elif status == 'READY_FOR_AI':
                ready_for_ai += 1

            if not row.get('latitude') or not row.get('longitude'):
                warn_missing_gps += 1
            if not row.get('soil_depth_cm'):
                warn_missing_depth += 1
            if row.get('physical_sample_available', '').upper() != 'YES':
                warn_missing_physical += 1

    # Image counting
    total_images = 0
    images_dir = base_path / 'raw'
    if images_dir.exists():
        total_images = len([f for f in images_dir.iterdir() if f.is_file() and f.name.lower().endswith(('.jpg', '.jpeg', '.png'))])

    print(f"\n--- CORE METRICS ---")
    print(f"Total Samples:         {total_samples}")
    print(f"Total Images:          {total_images}")
    print(f"Validated Samples:     {validated_samples}")
    print(f"Quarantined Samples:   {quarantined_samples}")

    print(f"\n--- LABORATORY PIPELINE ---")
    print(f"Ready for Laboratory:  {ready_for_lab}")
    print(f"Lab Results Received:  {lab_results_rec}")
    print(f"Ready for AI Training: {ready_for_ai}")

    print(f"\n--- DATA QUALITY WARNINGS ---")
    print(f"Missing GPS:           {warn_missing_gps}")
    print(f"Missing Depth:         {warn_missing_depth}")
    print(f"Missing Physical Smpl: {warn_missing_physical}")
    print("====================================\n")

if __name__ == "__main__":
    render_dashboard()
