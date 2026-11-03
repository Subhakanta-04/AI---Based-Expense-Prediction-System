"""
Unit tests for ML models, training, and metrics evaluation.
"""
import unittest
import os
from backend.app.services.ml_service import ml_service

class TestML(unittest.TestCase):
    def test_model_comparison_available(self):
        comp = ml_service.get_comparison()
        self.assertGreaterEqual(len(comp), 3)
        models = [c["Model"] for c in comp]
        self.assertIn("Random Forest", models)
        self.assertIn("Linear Regression", models)
        self.assertIn("Gradient Boosting", models)

    def test_best_model_selection(self):
        best = ml_service.get_best_model_info()
        self.assertIn("best_model_name", best)
        self.assertIn("test_metrics", best)
        self.assertGreater(best["test_metrics"]["r2"], 0)

    def test_feature_importance_validity(self):
        imps = ml_service.get_feature_importance()
        self.assertGreater(len(imps), 0)
        self.assertIn("feature", imps[0])
        self.assertIn("relative_importance", imps[0])

if __name__ == "__main__":
    unittest.main()
