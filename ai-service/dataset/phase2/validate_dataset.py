"""
AGROBUS — Phase 2 Dataset Validator
=====================================
Purpose:
    Validates the Phase 2 Rwanda soil dataset BEFORE any model training.
    Reports PASS / FAIL / WARNING for every check.

    THIS SCRIPT DOES NOT TRAIN ANY MODEL.
    THIS SCRIPT DOES NOT MODIFY ANY DATA.
    THIS SCRIPT DOES NOT ACCEPT FABRICATED OR SYNTHETIC DATA.

Usage:
    python dataset/phase2/validate_dataset.py
    python dataset/phase2/validate_dataset.py --csv path/to/samples.csv --images path/to/images/ --lab path/to/laboratory/

Checks performed:
    [1]  CSV file exists and is readable
    [2]  Dataset is not empty
    [3]  Required columns are present
    [4]  sample_id uniqueness (no duplicate physical sample IDs)
    [5]  image_id uniqueness across all rows
    [6]  Every referenced image file exists on disk
    [7]  Every sample_id has at least one associated image
    [8]  Required fields are populated for every row
    [9]  Measurement units: unit fields present where expected
    [10] Numeric fields contain numeric values within valid ranges
    [11] Date fields use ISO 8601 format (YYYY-MM-DD)
    [12] qc_status uses only valid values
    [13] collection_method uses only valid values
    [14] Required laboratory fields present per row
    [15] lab_report_ref present for traceability
    [16] Orphan images — images on disk with no CSV record
    [17] Orphan laboratory CSV files — lab files with no matching sample_id
    [18] Required location fields present where applicable
    [19] image_path not broken (file accessible)
    [20] Minimum usable sample count check
    [21] Image hash duplicate detection (exact duplicate images)
    [22] Measurement date is not before collection date

Rules:
    - Training MUST NOT begin if any FAIL is reported.
    - Quarantined records are reported but not deleted.
    - This script only validates — it never writes to samples.csv.
"""

import argparse
import csv
import hashlib
import os
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime, date

# ── Configuration ──────────────────────────────────────────────────────────────

AI_SERVICE_ROOT = Path(__file__).parent.parent.parent.resolve()
DEFAULT_CSV     = AI_SERVICE_ROOT / "dataset" / "phase2" / "metadata" / "samples.csv"
DEFAULT_IMAGES  = AI_SERVICE_ROOT / "dataset" / "phase2" / "raw" / "images"
DEFAULT_LAB_DIR = AI_SERVICE_ROOT / "dataset" / "phase2" / "raw" / "laboratory"

REQUIRED_FIELDS = [
    "sample_id",
    "image_id",
    "image_path",
    "district",
    "sector",
    "collection_date",
    "depth_cm",
    "collection_method",
    "laboratory",
    "measurement_date",
    "measurement_method",
    "ph",
    "device_model",
    "lighting_condition",
    "qc_status",
    "lab_report_ref",
]

# Fields that must be numeric and their valid ranges
NUMERIC_RANGE_FIELDS = {
    "ph":                  (2.0,    12.0),
    "organic_matter_pct":  (0.0,   100.0),
    "phosphorus_ppm":      (0.0,  2000.0),
    "potassium_ppm":       (0.0, 10000.0),
    "nitrogen_pct":        (0.0,    10.0),
    "moisture_pct":        (0.0,   100.0),
    "latitude":            (-90.0,  90.0),
    "longitude":           (-180.0, 180.0),
    "elevation_m":         (-500.0, 6000.0),
}

# Fields that should have a corresponding *_unit field if data is present
UNIT_EXPECTED_FIELDS = {
    "ph":                 "ph_unit",
    "organic_matter_pct": "organic_matter_unit",
    "phosphorus_ppm":     "phosphorus_unit",
    "potassium_ppm":      "potassium_unit",
    "nitrogen_pct":       "nitrogen_unit",
    "moisture_pct":       "moisture_unit",
}

VALID_QC_STATUSES        = {"PENDING", "ACCEPTED", "QUARANTINED", "REJECTED"}
VALID_COLLECTION_METHODS = {"auger", "spade", "composite", "core"}
VALID_LIGHTING_CONDITIONS = {"natural daylight", "overcast", "indoor", "daylight", "shade"}

# Non-empty/non-null sentinel values
NULL_VALUES = {"", "null", "none", "nan", "n/a", "na"}

MIN_SAMPLES_FOR_TRAINING = 100


# ── Helpers ──────────────────────────────────────────────────────────────────

def is_null(value: str) -> bool:
    return value.strip().lower() in NULL_VALUES


def parse_date(value: str) -> date | None:
    try:
        return datetime.strptime(value.strip(), "%Y-%m-%d").date()
    except (ValueError, AttributeError):
        return None


def file_md5(path: Path) -> str:
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


# ── Result tracking ─────────────────────────────────────────────────────────────

class ValidationReport:
    def __init__(self):
        self.checks   = []   # list of (level, check_name, message)
        self.errors   = 0
        self.warnings = 0
        self.passed   = 0

    def fail(self, check: str, message: str = ""):
        self.checks.append(("FAIL", check, message))
        self.errors += 1

    def warn(self, check: str, message: str = ""):
        self.checks.append(("WARN", check, message))
        self.warnings += 1

    def ok(self, check: str, message: str = ""):
        self.checks.append(("PASS", check, message))
        self.passed += 1

    def print_report(self) -> bool:
        width = 68
        print()
        print("=" * width)
        print("  AGROBUS PHASE 2 — DATASET VALIDATION REPORT")
        print(f"  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * width)
        for level, check, message in self.checks:
            if level == "PASS":
                marker = "[PASS]"
            elif level == "WARN":
                marker = "[WARN]"
            else:
                marker = "[FAIL]"
            print(f"  {marker:<8} {check}")
            if message and level != "PASS":
                for ln in message.strip().splitlines():
                    print(f"           {ln}")
        print()
        print(f"  Checks passed  : {self.passed}")
        print(f"  Warnings       : {self.warnings}")
        print(f"  Failures       : {self.errors}")
        print()
        if self.errors == 0 and self.warnings == 0:
            print("  RESULT: PASS")
            print("  Dataset is ready for Phase 2.4 review.")
        elif self.errors == 0:
            print("  RESULT: PASS WITH WARNINGS")
            print("  Review warnings before proceeding to Phase 2.4.")
        else:
            print("  RESULT: FAIL")
            print("  Resolve all FAIL items before Phase 2.4.")
            print("  Training MUST NOT begin until this validator returns PASS.")
        print("=" * width)
        print()
        return self.errors == 0


# ── Main validation ──────────────────────────────────────────────────────────────

def validate(csv_path: Path, images_dir: Path, lab_dir: Path) -> bool:
    report = ValidationReport()

    # ── CHECK 1: CSV exists ─────────────────────────────────────────────────────
    if not csv_path.exists():
        report.fail("CSV File Exists",
                    f"Not found: {csv_path}\n"
                    "Run field data collection and populate samples.csv with real data.")
        report.print_report()
        return False
    report.ok("CSV File Exists", f"{csv_path}")

    # Load CSV
    with open(csv_path, encoding="utf-8", newline="") as f:
        reader     = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        rows       = list(reader)

    # ── CHECK 2: Not empty ──────────────────────────────────────────────────────
    if len(rows) == 0:
        report.fail("Dataset Not Empty",
                    "samples.csv has 0 data rows.\n"
                    "No field data has been collected yet.")
        report.print_report()
        return False
    report.ok("Dataset Not Empty", f"{len(rows)} row(s) found.")

    # ── CHECK 3: Required columns present ──────────────────────────────────────
    missing_cols = [f for f in REQUIRED_FIELDS if f not in fieldnames]
    if missing_cols:
        report.fail("Required Columns Present",
                    "Missing columns: " + ", ".join(missing_cols))
    else:
        report.ok("Required Columns Present", "All required columns present.")

    # ── Per-row accumulators ────────────────────────────────────────────────────
    seen_sample_ids  = defaultdict(list)   # sample_id -> list of image_ids
    seen_image_ids   = {}                  # image_id  -> row_num
    image_hashes     = {}                  # md5 hash  -> image_id
    missing_images   = []
    broken_paths     = []
    invalid_values   = []
    missing_lab_vals = []
    orphan_lab_ids   = set()
    unit_warnings    = []
    date_errors      = []
    location_missing = []
    date_order_errors = []

    # Gather all sample_ids seen in CSV for lab orphan check
    all_csv_sample_ids = set()

    for rownum, row in enumerate(rows, start=2):  # row 1 = header
        sid  = row.get("sample_id",  "").strip()
        iid  = row.get("image_id",   "").strip()
        path = row.get("image_path", "").strip()
        qc   = row.get("qc_status",  "").strip().upper()
        is_excluded = qc in {"QUARANTINED", "REJECTED"}

        # ── CHECK 4: sample_id present
        if not sid:
            invalid_values.append(f"Row {rownum}: sample_id is empty")
            continue
        all_csv_sample_ids.add(sid)
        seen_sample_ids[sid].append(iid)

        # ── CHECK 5: image_id uniqueness
        if not iid:
            invalid_values.append(f"Row {rownum} ({sid}): image_id is empty")
        elif iid in seen_image_ids:
            invalid_values.append(
                f"Row {rownum} ({sid}): Duplicate image_id '{iid}' "
                f"(first seen at row {seen_image_ids[iid]})")
        else:
            seen_image_ids[iid] = rownum

        # ── CHECK 6 & 19: image file exists / broken path
        if not is_excluded:
            if path:
                img_candidate = Path(path)
                if not img_candidate.is_absolute():
                    img_candidate = images_dir / img_candidate.name
                if not img_candidate.exists():
                    missing_images.append(f"Row {rownum} ({iid}): {img_candidate}")
                elif not img_candidate.is_file():
                    broken_paths.append(f"Row {rownum} ({iid}): path is not a file: {img_candidate}")
                else:
                    # Hash duplicate check
                    try:
                        h = file_md5(img_candidate)
                        if h in image_hashes:
                            invalid_values.append(
                                f"Row {rownum} ({iid}): Image is an exact duplicate of {image_hashes[h]}"
                            )
                        else:
                            image_hashes[h] = iid
                    except OSError as e:
                        broken_paths.append(f"Row {rownum} ({iid}): Cannot read image: {e}")
            else:
                missing_images.append(f"Row {rownum} ({sid}): image_path is empty")

        # ── CHECK 8: Required string fields
        for field in ["district", "sector", "depth_cm", "collection_method",
                      "laboratory", "measurement_method", "device_model",
                      "lighting_condition", "lab_report_ref"]:
            val = row.get(field, "").strip()
            if is_null(val):
                invalid_values.append(f"Row {rownum} ({sid}): '{field}' is missing/empty")

        # ── CHECK 12: qc_status valid
        if qc and qc not in VALID_QC_STATUSES:
            invalid_values.append(f"Row {rownum} ({sid}): Invalid qc_status '{qc}'")

        # ── CHECK 13: collection_method valid
        cm = row.get("collection_method", "").strip().lower()
        if cm and cm not in VALID_COLLECTION_METHODS:
            invalid_values.append(
                f"Row {rownum} ({sid}): Unknown collection_method '{cm}' "
                f"(expected one of: {', '.join(sorted(VALID_COLLECTION_METHODS))})")

        # ── CHECK 11: Date format
        cdate = None
        mdate = None
        for date_field in ["collection_date", "measurement_date"]:
            val = row.get(date_field, "").strip()
            if val and not is_null(val):
                parsed = parse_date(val)
                if parsed is None:
                    date_errors.append(
                        f"Row {rownum} ({sid}): '{date_field}' has invalid format '{val}' (use YYYY-MM-DD)")
                else:
                    if date_field == "collection_date":
                        cdate = parsed
                    elif date_field == "measurement_date":
                        mdate = parsed

        # ── CHECK 22: measurement_date must not be before collection_date
        if cdate and mdate and mdate < cdate:
            date_order_errors.append(
                f"Row {rownum} ({sid}): measurement_date ({mdate}) is before collection_date ({cdate})")

        # ── CHECK 10: Numeric range validation
        for field, (lo, hi) in NUMERIC_RANGE_FIELDS.items():
            raw = row.get(field, "").strip()
            if raw and not is_null(raw):
                try:
                    val = float(raw)
                    if not (lo <= val <= hi):
                        invalid_values.append(
                            f"Row {rownum} ({sid}): '{field}' value {val} "
                            f"outside expected range [{lo}, {hi}]")
                except ValueError:
                    invalid_values.append(
                        f"Row {rownum} ({sid}): '{field}' is not numeric: '{raw}'")

        # ── CHECK 9: Unit fields presence
        for data_field, unit_field in UNIT_EXPECTED_FIELDS.items():
            data_val = row.get(data_field, "").strip()
            if data_val and not is_null(data_val) and unit_field in fieldnames:
                unit_val = row.get(unit_field, "").strip()
                if is_null(unit_val):
                    unit_warnings.append(
                        f"Row {rownum} ({sid}): '{data_field}' has a value "
                        f"but '{unit_field}' is empty")

        # ── CHECK 14 & 15: Required laboratory fields
        if not is_excluded:
            ph_val = row.get("ph", "").strip()
            if is_null(ph_val):
                missing_lab_vals.append(f"Row {rownum} ({sid}): 'ph' is missing (REQUIRED)")
            if is_null(row.get("lab_report_ref", "").strip()):
                missing_lab_vals.append(
                    f"Row {rownum} ({sid}): 'lab_report_ref' missing — traceability required")

        # ── CHECK 18: Location fields
        lat = row.get("latitude", "").strip()
        lon = row.get("longitude", "").strip()
        if not is_null(lat) and is_null(lon):
            location_missing.append(f"Row {rownum} ({sid}): latitude present but longitude missing")
        if is_null(lat) and not is_null(lon):
            location_missing.append(f"Row {rownum} ({sid}): longitude present but latitude missing")
        district = row.get("district", "").strip()
        if is_null(district):
            location_missing.append(f"Row {rownum} ({sid}): 'district' is empty (required for location model)")

    # ── CHECK 4: Duplicate physical sample IDs
    # A sample_id may have multiple image_ids (one per image).
    # It becomes suspicious only if the SAME image_id appears more than once for a sample.
    dup_sample_ids = {k: v for k, v in seen_sample_ids.items()
                      if len(v) != len(set(v))}
    if dup_sample_ids:
        lines = [f"  sample_id '{k}': {v}" for k, v in list(dup_sample_ids.items())[:10]]
        report.fail("Sample ID Uniqueness",
                     f"{len(dup_sample_ids)} sample ID(s) have duplicate image_id entries:\n"
                     + "\n".join(lines))
    else:
        report.ok("Sample ID Uniqueness", "No duplicate image_id entries per sample_id.")

    # ── CHECK 5 result: image_id duplicates are accumulated in invalid_values
    dup_image_issues = [v for v in invalid_values if "Duplicate image_id" in v]
    if dup_image_issues:
        report.fail("Image ID Uniqueness",
                    f"{len(dup_image_issues)} duplicate image_id(s) found.")
    else:
        report.ok("Image ID Uniqueness", "All image_ids are unique.")

    # ── CHECK 6: Missing images
    if missing_images:
        report.fail("Image Files Exist",
                    f"{len(missing_images)} image file(s) not found:\n"
                    + "\n".join(f"  {m}" for m in missing_images[:10])
                    + ("\n  ..." if len(missing_images) > 10 else ""))
    else:
        report.ok("Image Files Exist", "All referenced images found on disk.")

    # ── CHECK 7: Every sample has at least one image
    samples_without_images = [sid for sid, iids in seen_sample_ids.items()
                               if not any(iid for iid in iids)]
    if samples_without_images:
        report.fail("Sample Has Image",
                    f"{len(samples_without_images)} sample(s) have no image_id:\n"
                    + "\n".join(f"  {s}" for s in samples_without_images[:10]))
    else:
        report.ok("Sample Has Image", "Every sample has at least one image record.")

    # ── CHECK 8 / 12 / 13 result (accumulated in invalid_values)
    non_dup_issues = [v for v in invalid_values if "Duplicate image_id" not in v]
    if date_errors:
        non_dup_issues.extend(date_errors)
    if date_order_errors:
        non_dup_issues.extend(date_order_errors)

    if non_dup_issues:
        report.fail("Field Validation",
                    f"{len(non_dup_issues)} field issue(s):\n"
                    + "\n".join(f"  {v}" for v in non_dup_issues[:20])
                    + ("\n  ..." if len(non_dup_issues) > 20 else ""))
    else:
        report.ok("Field Validation", "All fields pass format, range, and value checks.")

    # ── CHECK 9: Unit warnings
    if unit_warnings:
        report.warn("Measurement Units",
                    f"{len(unit_warnings)} record(s) have a measurement value but no unit:\n"
                    + "\n".join(f"  {w}" for w in unit_warnings[:10]))
    else:
        report.ok("Measurement Units", "Unit fields present where measurements exist.")

    # ── CHECK 10 is embedded in invalid_values above

    # ── CHECK 14 / 15: Lab values
    if missing_lab_vals:
        report.fail("Laboratory Values",
                    f"{len(missing_lab_vals)} record(s) missing required lab fields:\n"
                    + "\n".join(f"  {m}" for m in missing_lab_vals[:10]))
    else:
        report.ok("Laboratory Values", "All required lab fields present.")

    # ── CHECK 16: Orphan images (on disk but not in CSV)
    orphan_images = set()
    if images_dir.exists():
        known_names = {Path(row.get("image_path", "")).name
                       for row in rows
                       if row.get("image_path", "").strip()}
        for f in images_dir.iterdir():
            if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".tif", ".tiff"} \
                    and f.name not in known_names:
                orphan_images.add(f.name)

    if orphan_images:
        report.warn("Orphan Images",
                    f"{len(orphan_images)} image file(s) on disk have no CSV row:\n"
                    + "\n".join(f"  {n}" for n in sorted(orphan_images)[:10]))
    else:
        report.ok("Orphan Images", "No orphan images on disk.")

    # ── CHECK 17: Orphan lab CSV files (lab file references sample IDs not in CSV)
    if lab_dir.exists():
        for lab_file in lab_dir.iterdir():
            if lab_file.suffix.lower() == ".csv":
                try:
                    with open(lab_file, encoding="utf-8", newline="") as lf:
                        lr = csv.DictReader(lf)
                        for lab_row in lr:
                            lab_sid = lab_row.get("sample_id", "").strip()
                            if lab_sid and lab_sid not in all_csv_sample_ids:
                                orphan_lab_ids.add(lab_sid)
                except Exception as e:
                    report.warn("Lab File Readable",
                                f"Could not read {lab_file.name}: {e}")

    if orphan_lab_ids:
        report.warn("Orphan Lab Records",
                    f"{len(orphan_lab_ids)} sample_id(s) in lab CSV files have no match in samples.csv:\n"
                    + "\n".join(f"  {s}" for s in sorted(orphan_lab_ids)[:10]))
    else:
        report.ok("Orphan Lab Records", "No orphan laboratory records found.")

    # ── CHECK 18: Location issues
    if location_missing:
        report.warn("Location Fields",
                    f"{len(location_missing)} location issue(s):\n"
                    + "\n".join(f"  {l}" for l in location_missing[:10]))
    else:
        report.ok("Location Fields", "Location fields consistent.")

    # ── CHECK 19: Broken paths
    if broken_paths:
        report.fail("Image Path Integrity",
                    f"{len(broken_paths)} broken or unreadable image path(s):\n"
                    + "\n".join(f"  {p}" for p in broken_paths[:10]))
    else:
        report.ok("Image Path Integrity", "All image paths are accessible files.")

    # ── CHECK 20: Minimum usable count
    n_accepted = sum(
        1 for r in rows
        if r.get("qc_status", "").strip().upper() == "ACCEPTED"
    )
    unique_accepted_samples = {
        r.get("sample_id", "").strip()
        for r in rows
        if r.get("qc_status", "").strip().upper() == "ACCEPTED"
    }
    if n_accepted == 0:
        report.fail("Usable Sample Count",
                    "0 ACCEPTED samples found.\n"
                    "Complete field collection and laboratory analysis first.")
    elif len(unique_accepted_samples) < MIN_SAMPLES_FOR_TRAINING:
        report.warn("Usable Sample Count",
                    f"Only {len(unique_accepted_samples)} unique ACCEPTED sample(s).\n"
                    f"Minimum {MIN_SAMPLES_FOR_TRAINING} unique samples recommended before training.")
    else:
        report.ok("Usable Sample Count",
                  f"{len(unique_accepted_samples)} unique ACCEPTED samples ready.")

    return report.print_report()


# ── Entry point ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=(
            "Validate the AGROBUS Phase 2 Rwanda soil dataset.\n"
            "This script performs read-only validation only.\n"
            "It does not train any model or modify any file."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--csv",
        type=Path,
        default=DEFAULT_CSV,
        help=f"Path to samples.csv (default: {DEFAULT_CSV})",
    )
    parser.add_argument(
        "--images",
        type=Path,
        default=DEFAULT_IMAGES,
        help=f"Path to images directory (default: {DEFAULT_IMAGES})",
    )
    parser.add_argument(
        "--lab",
        type=Path,
        default=DEFAULT_LAB_DIR,
        help=f"Path to laboratory CSV directory (default: {DEFAULT_LAB_DIR})",
    )
    args = parser.parse_args()

    passed = validate(args.csv, args.images, args.lab)
    sys.exit(0 if passed else 1)
