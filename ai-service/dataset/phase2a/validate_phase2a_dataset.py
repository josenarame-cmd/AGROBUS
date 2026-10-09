import os
import csv
import argparse
import hashlib
from pathlib import Path

def get_image_hash(filepath):
    """Returns MD5 hash of a file for duplicate detection."""
    hasher = hashlib.md5()
    try:
        with open(filepath, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()
    except Exception:
        return None

def validate_dataset(dataset_dir: str):
    base_path = Path(dataset_dir)
    metadata_path = base_path / 'metadata' / 'samples.csv'
    raw_images_path = base_path / 'raw'
    quarantine_path = base_path / 'quarantine'

    print("==============================================")
    print(" AGROBUS Phase 2A Master Validator ")
    print("==============================================\n")

    if not metadata_path.exists():
        print(f"[FAIL] Metadata file not found at {metadata_path}")
        return False

    print(f"[PASS] Metadata file found.")

    required_columns = {
        'sample_id', 'country', 'province', 'district', 'sector', 'cell', 'village',
        'latitude', 'longitude', 'elevation', 'collection_date', 'collection_time',
        'collector_id', 'soil_depth_cm', 'current_crop', 'previous_crop', 'planned_crop',
        'land_use', 'slope', 'drainage', 'weather_condition', 'soil_surface_condition',
        'moisture_visual_condition', 'device_used', 'notes', 'physical_sample_available',
        # Lab and Tracking Status
        'sample_status', 'laboratory_status', 'laboratory_sample_id', 'lab_name', 'lab_date',
        'lab_method', 'ph', 'nitrogen', 'phosphorus', 'potassium', 'organic_matter',
        'moisture', 'texture', 'laboratory_report_reference', 'qc_status'
    }

    sample_ids = {}
    validation_passed = True
    warnings = 0
    errors = 0

    with open(metadata_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        headers = set(reader.fieldnames if reader.fieldnames else [])

        missing_cols = required_columns - headers
        if missing_cols:
            print(f"[FAIL] Missing required columns: {missing_cols}")
            return False

        print("[PASS] All required metadata columns are present.")

        for row_idx, row in enumerate(reader, start=2):
            sample_id = row.get('sample_id', '').strip()
            if not sample_id:
                print(f"[FAIL] Row {row_idx}: Missing sample_id.")
                errors += 1
                validation_passed = False
                continue

            if sample_id in sample_ids:
                print(f"[FAIL] Row {row_idx}: Duplicate sample_id found: {sample_id}")
                errors += 1
                validation_passed = False
            else:
                sample_ids[sample_id] = row

            # Date validation
            date_val = row.get('collection_date', '').strip()
            if date_val and len(date_val) != 10:
                print(f"[WARNING] Sample {sample_id}: collection_date format unusual: {date_val}")
                warnings += 1

            # Lab values check (NO FABRICATION)
            for lab_col in ['ph', 'nitrogen', 'phosphorus', 'potassium', 'organic_matter']:
                if row.get(lab_col, '').strip():
                    print(f"[FAIL] Sample {sample_id}: Has data in {lab_col} but no lab partner is active. Remove fake data.")
                    errors += 1
                    validation_passed = False

    if not sample_ids:
        print("[WARNING] The metadata CSV contains no data rows (0 real samples).")
        warnings += 1

    # Image Checks & Duplicate Detection
    image_files = {}
    image_hashes = {}

    if raw_images_path.exists():
        for filename in os.listdir(raw_images_path):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                filepath = raw_images_path / filename
                base_name = filename.rsplit('_', 1)[0]

                if base_name not in image_files:
                    image_files[base_name] = []
                image_files[base_name].append(filename)

                file_hash = get_image_hash(filepath)
                if file_hash:
                    if file_hash in image_hashes:
                        print(f"[FAIL] Duplicate image detected via MD5 hash: {filename} matches {image_hashes[file_hash]}")
                        errors += 1
                        validation_passed = False
                    else:
                        image_hashes[file_hash] = filename

    for sample_id in sample_ids:
        if sample_id not in image_files or len(image_files[sample_id]) == 0:
            print(f"[FAIL] Sample {sample_id}: No images found in raw directory.")
            errors += 1
            validation_passed = False
        else:
            if len(image_files[sample_id]) < 3:
                print(f"[WARNING] Sample {sample_id}: Only {len(image_files[sample_id])} images found (recommended >= 3).")
                warnings += 1

    for base_name in image_files:
        if base_name not in sample_ids:
            print(f"[FAIL] Image file for unknown sample_id (Orphan Image): {base_name}")
            errors += 1
            validation_passed = False

    print("\n--- Validation Summary ---")
    print(f"Total Samples Checked:  {len(sample_ids)}")
    print(f"Total Warnings:         {warnings}")
    print(f"Total Errors:           {errors}")

    if validation_passed and errors == 0:
        print("\n=> RESULT: PASS")
        return True
    else:
        print("\n=> RESULT: FAIL")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate Phase 2A Dataset")
    parser.add_argument("--dataset_dir", type=str, default="dataset/phase2a", help="Path to the phase2a dataset directory")
    args = parser.parse_args()

    validate_dataset(args.dataset_dir)
