"""
Tests for the confidence assessment logic.
"""
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import unittest
from prediction.predict import assess_confidence

class TestConfidenceLogic(unittest.TestCase):

    def test_high_confidence(self):
        # 0.95 -> HIGH -> review not required
        res1 = assess_confidence(0.95)
        self.assertEqual(res1["confidence_level"], "HIGH")
        self.assertFalse(res1["review_required"])
        self.assertEqual(res1["review_status"], "NOT_REQUIRED")

        # 0.80 -> HIGH -> review not required
        res2 = assess_confidence(0.80)
        self.assertEqual(res2["confidence_level"], "HIGH")
        self.assertFalse(res2["review_required"])
        self.assertEqual(res2["review_status"], "NOT_REQUIRED")

    def test_medium_confidence(self):
        # 0.79 -> MEDIUM -> review recommended
        res1 = assess_confidence(0.79)
        self.assertEqual(res1["confidence_level"], "MEDIUM")
        self.assertTrue(res1["review_required"])
        self.assertEqual(res1["review_status"], "PENDING")
        self.assertEqual(res1["review_flag_label"], "RECOMMENDED")

        # 0.50 -> MEDIUM -> review recommended
        res2 = assess_confidence(0.50)
        self.assertEqual(res2["confidence_level"], "MEDIUM")
        self.assertTrue(res2["review_required"])
        self.assertEqual(res2["review_status"], "PENDING")
        self.assertEqual(res1["review_flag_label"], "RECOMMENDED")

    def test_low_confidence(self):
        # 0.49 -> LOW -> review required
        res1 = assess_confidence(0.49)
        self.assertEqual(res1["confidence_level"], "LOW")
        self.assertTrue(res1["review_required"])
        self.assertEqual(res1["review_status"], "PENDING")
        self.assertEqual(res1["review_flag_label"], "REQUIRED")

        # 0.20 -> LOW -> review required
        res2 = assess_confidence(0.20)
        self.assertEqual(res2["confidence_level"], "LOW")
        self.assertTrue(res2["review_required"])
        self.assertEqual(res2["review_status"], "PENDING")
        self.assertEqual(res1["review_flag_label"], "REQUIRED")

if __name__ == '__main__':
    unittest.main()
