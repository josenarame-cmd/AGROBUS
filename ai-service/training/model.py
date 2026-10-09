"""
AGROBUS — AI Soil Analysis Service
Model definition: EfficientNet-B0 fine-tuned for soil classification.

Architecture choice rationale
──────────────────────────────
EfficientNet-B0 was selected because:
  • It achieves strong accuracy (77 % top-1 on ImageNet) at only 5.3 M parameters.
  • Low memory footprint allows training on a laptop-class GPU or even CPU.
  • torchvision / timm provide pre-trained ImageNet weights, giving a strong
    feature extractor baseline even with a small soil-specific dataset.
  • The architecture scales cleanly (B1 → B7) if higher accuracy is needed later.

Transfer learning strategy
──────────────────────────
Phase 1 (first 5 epochs by default):
  Freeze the feature extractor backbone; train only the new classifier head.
  This prevents overwriting the pre-trained features before the head adapts.

Phase 2 (remaining epochs):
  Unfreeze ALL layers and fine-tune end-to-end with a low learning rate.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import torch
import torch.nn as nn

try:
    import timm
    _TIMM_AVAILABLE = True
except ImportError:
    _TIMM_AVAILABLE = False

from config import MODEL_ARCH, PRETRAINED, NUM_CLASSES, DROPOUT_RATE


def build_model(
    num_classes: int = NUM_CLASSES,
    pretrained: bool = PRETRAINED,
    dropout_rate: float = DROPOUT_RATE,
) -> nn.Module:
    """
    Build and return the soil classification model.

    Uses timm if available (preferred); falls back to torchvision's
    EfficientNet-B0 as a secondary option.
    """
    if _TIMM_AVAILABLE:
        model = timm.create_model(
            MODEL_ARCH,
            pretrained=pretrained,
            num_classes=0,       # remove original classifier
            drop_rate=dropout_rate,
        )
        in_features = model.num_features

        model.classifier = nn.Sequential(
            nn.Dropout(dropout_rate),
            nn.Linear(in_features, num_classes),
        )
    else:
        # Fallback: torchvision EfficientNet
        from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights
        weights = EfficientNet_B0_Weights.DEFAULT if pretrained else None
        model = efficientnet_b0(weights=weights)
        in_features = model.classifier[1].in_features
        model.classifier = nn.Sequential(
            nn.Dropout(dropout_rate),
            nn.Linear(in_features, num_classes),
        )

    return model


def freeze_backbone(model: nn.Module) -> None:
    """Freeze all layers except the classifier head (Phase 1)."""
    for name, param in model.named_parameters():
        if "classifier" not in name:
            param.requires_grad = False
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"  Backbone frozen. Trainable parameters: {trainable:,}")


def unfreeze_all(model: nn.Module) -> None:
    """Unfreeze all layers for end-to-end fine-tuning (Phase 2)."""
    for param in model.parameters():
        param.requires_grad = True
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"  All layers unfrozen. Trainable parameters: {trainable:,}")


def count_parameters(model: nn.Module) -> tuple[int, int]:
    """Return (total_params, trainable_params)."""
    total     = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    return total, trainable


def save_model(model: nn.Module, path: Path, class_names: list[str]) -> None:
    """Save model weights + metadata to a single .pth file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    torch.save(
        {
            "model_state_dict": model.state_dict(),
            "class_names": class_names,
            "arch": MODEL_ARCH,
            "num_classes": len(class_names),
            "dropout_rate": DROPOUT_RATE,
        },
        path,
    )
    print(f"  Model saved → {path}")


def load_model(path: Path, device: torch.device | None = None) -> tuple[nn.Module, list[str]]:
    """Load a saved model checkpoint. Returns (model, class_names)."""
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    checkpoint = torch.load(path, map_location=device)
    class_names = checkpoint["class_names"]
    num_classes  = checkpoint["num_classes"]

    model = build_model(num_classes=num_classes, pretrained=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()
    print(f"  Model loaded from {path}  (classes: {class_names})")
    return model, class_names
