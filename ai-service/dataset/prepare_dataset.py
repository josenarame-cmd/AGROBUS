"""
AGROBUS — AI Soil Analysis Service
Dataset Preparation Script
===========================================================
Purpose:
  1. Verify that the soil image dataset exists in ai-service/dataset/raw/
  2. Compute per-class image counts and flag any missing or empty classes.
  3. Build a stratified train / validation / test split and copy images into
     ai-service/dataset/processed/{train,val,test}/<ClassName>/ folders.

Usage:
  python dataset/prepare_dataset.py [--raw-dir <path>] [--force]

Dataset:
  Name    : Soil Image Dataset
  Source  : https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset
  License : CDLA-Permissive-1.0 (academic / prototype use — attribution required)

Download instructions (one-time setup):
  a) Install Kaggle CLI:  pip install kaggle
  b) Place your kaggle.json API token in ~/.kaggle/kaggle.json
  c) Run:
       kaggle datasets download -d jayaprakashpondy/soil-image-dataset \\
           -p ai-service/dataset/raw --unzip
  d) Then re-run this script.

  Alternatively, download via the Kaggle web UI and unzip into:
       ai-service/dataset/raw/
  so that the structure looks like:
       raw/
         Alluvial Soil/   (or similar folder names)
         Black Soil/
         Clay Soil/
         Red Soil/
"""

import argparse
import os
import shutil
import sys
from pathlib import Path

# Allow imports from the project root
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
from sklearn.model_selection import train_test_split
from tqdm import tqdm

from config import (
    RAW_DIR,
    PROCESSED_DIR,
    CLASS_NAMES,
    TRAIN_RATIO,
    VAL_RATIO,
    TEST_RATIO,
    RANDOM_SEED,
)

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}


def find_raw_class_dirs(raw_dir: Path) -> dict[str, list[Path]]:
    """
    Scan raw_dir for sub-folders whose names match (or fuzzy-match)
    the expected CLASS_NAMES.  Returns {class_name: list_of_folder_paths}.
    """
    found: dict[str, list[Path]] = {cls: [] for cls in CLASS_NAMES}
    if not raw_dir.exists():
        return {}

    sub_dirs = [d for d in raw_dir.rglob('*') if d.is_dir()]
    for cls in CLASS_NAMES:
        for d in sub_dirs:
            if d.name.lower() == cls.lower() or cls.lower() in d.name.lower() or d.name.lower() in cls.lower():
                found[cls].append(d)

    # filter empty
    return {k: list(set(v)) for k, v in found.items() if v}


def collect_images(class_dir: Path) -> list[Path]:
    """Recursively collect all valid image files under class_dir."""
    images = []
    for ext in VALID_EXTENSIONS:
        images.extend(class_dir.rglob(f"*{ext}"))
        images.extend(class_dir.rglob(f"*{ext.upper()}"))
    return sorted(set(images))  # de-duplicate


def split_and_copy(
    images: list[Path],
    class_name: str,
    processed_dir: Path,
    force: bool = False,
) -> dict[str, int]:
    """
    Split image list into train/val/test and copy to processed directory.
    Returns counts per split.
    """
    n = len(images)
    if n < 3:
        print(f"  [WARN] {class_name}: only {n} images — cannot split. Skipping.")
        return {"train": 0, "val": 0, "test": 0}

    # stratified split
    idx = list(range(n))
    train_idx, temp_idx = train_test_split(
        idx,
        test_size=(1 - TRAIN_RATIO),
        random_state=RANDOM_SEED,
    )
    relative_val = VAL_RATIO / (VAL_RATIO + TEST_RATIO)
    val_idx, test_idx = train_test_split(
        temp_idx,
        test_size=(1 - relative_val),
        random_state=RANDOM_SEED,
    )

    splits = {"train": train_idx, "val": val_idx, "test": test_idx}
    counts: dict[str, int] = {}

    for split_name, idxs in splits.items():
        dest_dir = processed_dir / split_name / class_name
        if dest_dir.exists() and not force:
            existing = len(list(dest_dir.iterdir()))
            if existing == len(idxs):
                print(f"  [SKIP] {split_name}/{class_name}: {existing} files already exist.")
                counts[split_name] = existing
                continue
        dest_dir.mkdir(parents=True, exist_ok=True)
        for i in tqdm(idxs, desc=f"  Copying {split_name}/{class_name}", leave=False):
            src = images[i]
            dst = dest_dir / src.name
            shutil.copy2(src, dst)
        counts[split_name] = len(idxs)

    return counts


def main(raw_dir: Path, processed_dir: Path, force: bool) -> None:
    print("=" * 60)
    print("AGROBUS — AI Soil Analysis: Dataset Preparation")
    print("=" * 60)
    print(f"Raw data directory : {raw_dir}")
    print(f"Processed directory: {processed_dir}")
    print()

    # 1. Locate class folders
    class_dirs = find_raw_class_dirs(raw_dir)

    if not class_dirs:
        print("[ERROR] No matching class folders found in the raw directory.\n")
        print("Please download the dataset first:")
        print("  kaggle datasets download -d jayaprakashpondy/soil-image-dataset \\")
        print(f"      -p {raw_dir} --unzip\n")
        print("Or download manually from:")
        print("  https://www.kaggle.com/datasets/jayaprakashpondy/soil-image-dataset\n")
        sys.exit(1)

    # 2. Summary of found classes
    print(f"Found {len(class_dirs)} / {len(CLASS_NAMES)} expected classes:\n")
    all_counts: dict[str, dict] = {}
    for cls in CLASS_NAMES:
        if cls in class_dirs:
            imgs = []
            for d in class_dirs[cls]:
                imgs.extend(collect_images(d))
            imgs = sorted(set(imgs))
            all_counts[cls] = {"images": imgs, "n": len(imgs)}
            status = f"{len(imgs):5d} images  →  {len(class_dirs[cls])} directories"
        else:
            all_counts[cls] = {"images": [], "n": 0}
            status = "  NOT FOUND"
        print(f"  {cls:<20s}: {status}")
    print()

    # 3. Split and copy
    print("Building train / val / test splits …\n")
    grand_total = {"train": 0, "val": 0, "test": 0}
    for cls, info in all_counts.items():
        if info["n"] == 0:
            print(f"  [WARN] Skipping {cls} (no images).")
            continue
        print(f"  Processing: {cls} ({info['n']} images)")
        counts = split_and_copy(info["images"], cls, processed_dir, force=force)
        for k in grand_total:
            grand_total[k] += counts.get(k, 0)
        print(f"    train={counts.get('train',0)}  val={counts.get('val',0)}  test={counts.get('test',0)}")
        print()

    # 4. Final summary
    total = sum(grand_total.values())
    print("=" * 60)
    print("Dataset split summary:")
    print(f"  Train : {grand_total['train']:5d} images  ({grand_total['train']/max(total,1)*100:.1f} %)")
    print(f"  Val   : {grand_total['val']:5d} images  ({grand_total['val']/max(total,1)*100:.1f} %)")
    print(f"  Test  : {grand_total['test']:5d} images  ({grand_total['test']/max(total,1)*100:.1f} %)")
    print(f"  TOTAL : {total:5d} images")
    print()
    print("Processed data saved to:", processed_dir)
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Prepare the AGROBUS soil image dataset."
    )
    parser.add_argument(
        "--raw-dir",
        type=Path,
        default=RAW_DIR,
        help="Path to the raw dataset directory (default: ai-service/dataset/raw)",
    )
    parser.add_argument(
        "--processed-dir",
        type=Path,
        default=PROCESSED_DIR,
        help="Output directory for processed splits (default: ai-service/dataset/processed)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-copy files even if destination already exists.",
    )
    args = parser.parse_args()
    main(args.raw_dir, args.processed_dir, args.force)
