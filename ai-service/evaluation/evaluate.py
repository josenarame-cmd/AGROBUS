"""
AGROBUS — AI Soil Analysis Service
Evaluation Script
===========================================================
Usage:
    python evaluation/evaluate.py [--model-path <path>] [--output-dir <path>]

Outputs (saved to evaluation/):
  • evaluation_report.txt   — accuracy, precision, recall, F1, per-class
  • confusion_matrix.png    — colour-coded confusion matrix
  • training_curves.png     — loss & accuracy curves (from training_log.csv)
  • roc_curves.png          — one-vs-rest ROC curves per class
"""

import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import argparse
import numpy as np
import torch
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")   # headless / no GUI required
import seaborn as sns

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    roc_curve,
)

from config import MODEL_PATH, EVALUATION_DIR, PROCESSED_DIR, NUM_WORKERS, BATCH_SIZE
from utils.data_utils import get_dataloaders
from training.model import load_model


# ── Inference helpers ─────────────────────────────────────────────────────────

def run_inference(
    model: torch.nn.Module,
    loader: torch.utils.data.DataLoader,
    device: torch.device,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Run model over a DataLoader.
    Returns: (true_labels, predicted_labels, probabilities[N, C])
    """
    all_labels: list[int] = []
    all_preds:  list[int] = []
    all_probs:  list[np.ndarray] = []

    model.eval()
    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1).cpu().numpy()
            preds = probs.argmax(axis=1)
            all_labels.extend(labels.numpy())
            all_preds.extend(preds)
            all_probs.append(probs)

    return (
        np.array(all_labels),
        np.array(all_preds),
        np.vstack(all_probs),
    )


# ── Plot helpers ──────────────────────────────────────────────────────────────

def plot_confusion_matrix(
    cm: np.ndarray,
    class_names: list[str],
    output_path: Path,
) -> None:
    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="YlOrRd",
        xticklabels=class_names,
        yticklabels=class_names,
        ax=ax,
    )
    ax.set_title("Confusion Matrix — AGROBUS Soil Classifier", fontsize=14, fontweight="bold")
    ax.set_xlabel("Predicted Label", fontsize=12)
    ax.set_ylabel("True Label", fontsize=12)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"  Confusion matrix → {output_path}")


def plot_training_curves(log_path: Path, output_path: Path) -> None:
    if not log_path.exists():
        print(f"  [SKIP] Training log not found: {log_path}")
        return

    import csv
    epochs, train_loss, val_loss, train_acc, val_acc = [], [], [], [], []
    with open(log_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            epochs.append(int(row["epoch"]))
            train_loss.append(float(row["train_loss"]))
            val_loss.append(float(row["val_loss"]))
            train_acc.append(float(row["train_acc"]))
            val_acc.append(float(row["val_acc"]))

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    ax1.plot(epochs, train_loss, label="Train Loss", color="#2196F3", linewidth=2)
    ax1.plot(epochs, val_loss,   label="Val Loss",   color="#F44336", linewidth=2)
    ax1.set_title("Training vs Validation Loss", fontsize=13, fontweight="bold")
    ax1.set_xlabel("Epoch"); ax1.set_ylabel("Loss")
    ax1.legend(); ax1.grid(alpha=0.3)

    ax2.plot(epochs, [a * 100 for a in train_acc], label="Train Acc", color="#4CAF50", linewidth=2)
    ax2.plot(epochs, [a * 100 for a in val_acc],   label="Val Acc",   color="#FF9800", linewidth=2)
    ax2.set_title("Training vs Validation Accuracy", fontsize=13, fontweight="bold")
    ax2.set_xlabel("Epoch"); ax2.set_ylabel("Accuracy (%)")
    ax2.legend(); ax2.grid(alpha=0.3)

    fig.suptitle("AGROBUS Soil Classifier — Training Curves", fontsize=15, fontweight="bold")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"  Training curves → {output_path}")


def plot_roc_curves(
    probs: np.ndarray,
    true_labels: np.ndarray,
    class_names: list[str],
    output_path: Path,
) -> None:
    from sklearn.preprocessing import label_binarize

    n_classes = len(class_names)
    y_bin = label_binarize(true_labels, classes=list(range(n_classes)))

    colors = ["#2196F3", "#4CAF50", "#F44336", "#FF9800", "#9C27B0", "#00BCD4"]
    fig, ax = plt.subplots(figsize=(9, 7))

    for i, cls in enumerate(class_names):
        fpr, tpr, _ = roc_curve(y_bin[:, i], probs[:, i])
        try:
            auc = roc_auc_score(y_bin[:, i], probs[:, i])
        except Exception:
            auc = float("nan")
        ax.plot(fpr, tpr, label=f"{cls} (AUC={auc:.3f})", linewidth=2,
                color=colors[i % len(colors)])

    ax.plot([0, 1], [0, 1], "k--", linewidth=1, label="Random (AUC=0.5)")
    ax.set_title("ROC Curves — AGROBUS Soil Classifier", fontsize=14, fontweight="bold")
    ax.set_xlabel("False Positive Rate"); ax.set_ylabel("True Positive Rate")
    ax.legend(loc="lower right"); ax.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"  ROC curves      → {output_path}")


# ── Main ──────────────────────────────────────────────────────────────────────

def evaluate(model_path: Path, output_dir: Path) -> None:
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print(f"\n{'='*60}")
    print("AGROBUS — AI Soil Analysis: Model Evaluation")
    print(f"{'='*60}")
    print(f"Model  : {model_path}")
    print(f"Device : {device}\n")

    if not model_path.exists():
        print(f"[ERROR] Model checkpoint not found: {model_path}")
        print("Run  python training/train.py  first.")
        sys.exit(1)

    # Data
    _, _, test_loader, _ = get_dataloaders(
        processed_dir=PROCESSED_DIR,
        batch_size=BATCH_SIZE,
        num_workers=NUM_WORKERS,
    )

    # Model
    model, class_names = load_model(model_path, device)
    print()

    # Inference
    print("Running inference on test set …")
    true_labels, pred_labels, probs = run_inference(model, test_loader, device)

    # Metrics
    accuracy  = accuracy_score(true_labels, pred_labels)
    report    = classification_report(true_labels, pred_labels, target_names=class_names, digits=4)
    cm        = confusion_matrix(true_labels, pred_labels)

    print(f"\nTest Accuracy : {accuracy * 100:.2f} %\n")
    print("Classification Report:")
    print(report)

    # Save text report
    output_dir.mkdir(parents=True, exist_ok=True)
    report_path = output_dir / "evaluation_report.txt"
    with open(report_path, "w") as f:
        f.write("AGROBUS — AI Soil Analysis: Evaluation Report\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Test Accuracy : {accuracy * 100:.2f} %\n\n")
        f.write("Classification Report:\n")
        f.write(report + "\n")
        f.write("Confusion Matrix (rows=true, cols=pred):\n")
        f.write(f"Classes: {class_names}\n\n")
        f.write(str(cm) + "\n\n")
        f.write("IMPORTANT LIMITATION:\n")
        f.write(
            "This evaluation reflects model performance on the held-out test split\n"
            "of the training dataset. It does NOT represent performance on real-world\n"
            "Rwandan or East African soil samples. Local field validation with\n"
            "agronomist review is required before any production deployment.\n"
        )
    print(f"\n  Evaluation report → {report_path}")

    # Plots
    plot_confusion_matrix(cm, class_names, output_dir / "confusion_matrix.png")
    plot_training_curves(output_dir / "training_log.csv", output_dir / "training_curves.png")
    plot_roc_curves(probs, true_labels, class_names, output_dir / "roc_curves.png")

    print(f"\n{'='*60}")
    print("Evaluation complete.")
    print(f"All outputs saved to: {output_dir}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate the AGROBUS soil classifier.")
    parser.add_argument("--model-path", type=Path, default=MODEL_PATH)
    parser.add_argument("--output-dir", type=Path, default=EVALUATION_DIR)
    args = parser.parse_args()
    evaluate(args.model_path, args.output_dir)
