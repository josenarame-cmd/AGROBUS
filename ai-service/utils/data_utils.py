"""
AGROBUS — AI Soil Analysis Service
Shared data utilities: transforms, custom Dataset class, DataLoader factory.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import torch
from torch.utils.data import DataLoader, Dataset
from torchvision import datasets, transforms
from PIL import Image

from config import (
    PROCESSED_DIR,
    IMAGE_SIZE,
    MEAN,
    STD,
    BATCH_SIZE,
    NUM_WORKERS,
    CLASS_NAMES,
)


# ── Transforms ───────────────────────────────────────────────────────────────

def get_train_transform() -> transforms.Compose:
    """Data-augmentation pipeline for training images."""
    return transforms.Compose([
        transforms.Resize((IMAGE_SIZE + 32, IMAGE_SIZE + 32)),
        transforms.RandomCrop(IMAGE_SIZE),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05),
        transforms.RandomRotation(degrees=30),
        transforms.ToTensor(),
        transforms.Normalize(mean=MEAN, std=STD),
    ])


def get_eval_transform() -> transforms.Compose:
    """Deterministic pipeline for validation / test / inference."""
    return transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=MEAN, std=STD),
    ])


# ── Dataset factory ──────────────────────────────────────────────────────────

def get_dataloaders(
    processed_dir: Path = PROCESSED_DIR,
    batch_size: int = BATCH_SIZE,
    num_workers: int = NUM_WORKERS,
) -> tuple[DataLoader, DataLoader, DataLoader, list[str]]:
    """
    Build train / val / test DataLoaders from the processed directory.

    Returns:
        train_loader, val_loader, test_loader, class_names
    """
    train_dir = processed_dir / "train"
    val_dir   = processed_dir / "val"
    test_dir  = processed_dir / "test"

    for split_dir in (train_dir, val_dir, test_dir):
        if not split_dir.exists():
            raise FileNotFoundError(
                f"Split directory not found: {split_dir}\n"
                "Run  python dataset/prepare_dataset.py  first."
            )

    train_ds = datasets.ImageFolder(str(train_dir), transform=get_train_transform())
    val_ds   = datasets.ImageFolder(str(val_dir),   transform=get_eval_transform())
    test_ds  = datasets.ImageFolder(str(test_dir),  transform=get_eval_transform())

    # Warn if discovered class order differs from config
    discovered = train_ds.classes
    if discovered != CLASS_NAMES:
        print(
            f"[WARN] Dataset classes differ from config.CLASS_NAMES.\n"
            f"  config  : {CLASS_NAMES}\n"
            f"  dataset : {discovered}\n"
            "Using dataset ordering for this run."
        )

    train_loader = DataLoader(
        train_ds, batch_size=batch_size, shuffle=True,
        num_workers=num_workers, pin_memory=torch.cuda.is_available()
    )
    val_loader = DataLoader(
        val_ds, batch_size=batch_size, shuffle=False,
        num_workers=num_workers, pin_memory=torch.cuda.is_available()
    )
    test_loader = DataLoader(
        test_ds, batch_size=batch_size, shuffle=False,
        num_workers=num_workers, pin_memory=torch.cuda.is_available()
    )

    print(f"  Train : {len(train_ds):5d} images across {len(train_ds.classes)} classes")
    print(f"  Val   : {len(val_ds):5d} images")
    print(f"  Test  : {len(test_ds):5d} images")
    print(f"  Classes: {train_ds.classes}")

    return train_loader, val_loader, test_loader, train_ds.classes


# ── Single-image inference helper ────────────────────────────────────────────

def load_single_image(image_path: str | Path) -> torch.Tensor:
    """
    Load one image file and return a (1, C, H, W) tensor ready for the model.
    """
    transform = get_eval_transform()
    img = Image.open(image_path).convert("RGB")
    tensor = transform(img).unsqueeze(0)   # add batch dimension
    return tensor
