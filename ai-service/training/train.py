"""
AGROBUS — AI Soil Analysis Service
Training Script
===========================================================
Usage:
    python training/train.py [--epochs N] [--batch-size N] [--lr F] [--no-freeze]

The script:
  1. Loads DataLoaders from the processed dataset directory.
  2. Builds an EfficientNet-B0 model with ImageNet pre-trained weights.
  3. Trains with a two-phase strategy:
       Phase 1 — frozen backbone, warm up the classification head.
       Phase 2 — unfreeze all, fine-tune end-to-end.
  4. Applies early stopping to avoid over-fitting on the small dataset.
  5. Saves the best-validation-accuracy checkpoint to models/saved/.
  6. Writes a training_log.csv in the evaluation/ directory.
"""

import argparse
import csv
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import CosineAnnealingLR

from config import (
    NUM_EPOCHS,
    LEARNING_RATE,
    WEIGHT_DECAY,
    PATIENCE,
    MODEL_PATH,
    EVALUATION_DIR,
    BATCH_SIZE,
    NUM_WORKERS,
)
from utils.data_utils import get_dataloaders
from training.model import build_model, freeze_backbone, unfreeze_all, save_model, count_parameters

# ── Helpers ───────────────────────────────────────────────────────────────────

def epoch_pass(
    model: nn.Module,
    loader: torch.utils.data.DataLoader,
    criterion: nn.Module,
    optimizer: optim.Optimizer | None,
    device: torch.device,
    training: bool,
) -> tuple[float, float]:
    """Run one full epoch. Returns (avg_loss, accuracy)."""
    model.train(training)
    total_loss = 0.0
    correct = 0
    total = 0

    with torch.set_grad_enabled(training):
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)

            if training:
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

            total_loss += loss.item() * images.size(0)
            preds = outputs.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += images.size(0)

    avg_loss = total_loss / total if total else 0.0
    accuracy = correct / total if total else 0.0
    return avg_loss, accuracy


# ── Main training loop ────────────────────────────────────────────────────────

def train(
    epochs: int,
    batch_size: int,
    lr: float,
    freeze_epochs: int,
) -> None:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n{'='*60}")
    print("AGROBUS — AI Soil Analysis: Model Training")
    print(f"{'='*60}")
    print(f"Device : {device}")
    print(f"Epochs : {epochs}  (Phase-1 frozen: {freeze_epochs})")
    print(f"LR     : {lr}  |  Batch: {batch_size}\n")

    # Data
    train_loader, val_loader, _, class_names = get_dataloaders(
        batch_size=batch_size,
        num_workers=NUM_WORKERS,
    )

    # Model
    model = build_model(num_classes=len(class_names))
    model.to(device)

    total, trainable = count_parameters(model)
    print(f"\nModel parameters: total={total:,}  trainable={trainable:,}\n")

    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=lr,
        weight_decay=WEIGHT_DECAY,
    )
    scheduler = CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)

    # Logging
    EVALUATION_DIR.mkdir(parents=True, exist_ok=True)
    log_path = EVALUATION_DIR / "training_log.csv"
    log_rows: list[dict] = []

    best_val_acc = 0.0
    patience_counter = 0

    for epoch in range(1, epochs + 1):
        start = time.time()

        # Phase transition
        if epoch == 1:
            print("Phase 1: Freezing backbone — training classifier head only.")
            freeze_backbone(model)
            optimizer = optim.AdamW(
                filter(lambda p: p.requires_grad, model.parameters()),
                lr=lr, weight_decay=WEIGHT_DECAY,
            )
            scheduler = CosineAnnealingLR(optimizer, T_max=max(epochs - freeze_epochs, 1), eta_min=1e-6)

        elif epoch == freeze_epochs + 1:
            print(f"\nPhase 2 (epoch {epoch}): Unfreezing all layers — end-to-end fine-tuning.")
            unfreeze_all(model)
            optimizer = optim.AdamW(
                model.parameters(),
                lr=lr * 0.1,   # lower LR for fine-tuning
                weight_decay=WEIGHT_DECAY,
            )
            scheduler = CosineAnnealingLR(optimizer, T_max=epochs - freeze_epochs, eta_min=1e-7)

        # Forward passes
        train_loss, train_acc = epoch_pass(model, train_loader, criterion, optimizer, device, training=True)
        val_loss, val_acc     = epoch_pass(model, val_loader,   criterion, None,      device, training=False)
        scheduler.step()

        elapsed = time.time() - start
        print(
            f"Epoch [{epoch:3d}/{epochs}] "
            f"train_loss={train_loss:.4f}  train_acc={train_acc:.4f}  "
            f"val_loss={val_loss:.4f}  val_acc={val_acc:.4f}  "
            f"time={elapsed:.1f}s"
        )

        log_rows.append({
            "epoch": epoch,
            "train_loss": f"{train_loss:.6f}",
            "train_acc":  f"{train_acc:.6f}",
            "val_loss":   f"{val_loss:.6f}",
            "val_acc":    f"{val_acc:.6f}",
            "elapsed_s":  f"{elapsed:.2f}",
        })

        # Checkpoint best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            patience_counter = 0
            save_model(model, MODEL_PATH, class_names)
            print(f"  ★  New best val_acc={val_acc:.4f} — checkpoint saved.")
        else:
            patience_counter += 1
            if patience_counter >= PATIENCE:
                print(f"\n  Early stopping triggered after {epoch} epochs (patience={PATIENCE}).")
                break

    # Write log CSV
    with open(log_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=log_rows[0].keys())
        writer.writeheader()
        writer.writerows(log_rows)

    print(f"\n{'='*60}")
    print(f"Training complete.  Best val accuracy: {best_val_acc:.4f}")
    print(f"Model checkpoint : {MODEL_PATH}")
    print(f"Training log     : {log_path}")
    print(f"{'='*60}\n")
    print("Next step: run  python evaluation/evaluate.py  to see test metrics.")


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the AGROBUS soil classifier.")
    parser.add_argument("--epochs",        type=int,   default=NUM_EPOCHS,    help="Total training epochs")
    parser.add_argument("--batch-size",    type=int,   default=BATCH_SIZE,    help="Mini-batch size")
    parser.add_argument("--lr",            type=float, default=LEARNING_RATE, help="Initial learning rate")
    parser.add_argument("--freeze-epochs", type=int,   default=5,             help="Epochs to keep backbone frozen")
    args = parser.parse_args()

    train(
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        freeze_epochs=args.freeze_epochs,
    )
