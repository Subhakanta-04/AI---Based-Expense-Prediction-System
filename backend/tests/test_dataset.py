"""
Unit tests for Fyte data loader & dataset service.
"""
import unittest
import pandas as pd
from ml.src.data_loader import load_dataset, validate_dataset, get_dataset_summary
from backend.app.services.dataset_service import dataset_service

class TestDataset(unittest.TestCase):
    def test_load_dataset(self):
        df = load_dataset("data/raw/expense_data.csv")
        self.assertGreater(len(df), 100)
        self.assertIn("Amount", df.columns)
        self.assertIn("Category", df.columns)

    def test_validate_dataset(self):
        df = load_dataset("data/raw/expense_data.csv")
        valid, msg = validate_dataset(df)
        self.assertTrue(valid)

    def test_summary_statistics(self):
        summary = dataset_service.get_info()
        self.assertGreater(summary["num_records"], 100)
        self.assertIn("amount_stats", summary)
        self.assertGreater(summary["amount_stats"]["mean"], 0)

if __name__ == "__main__":
    unittest.main()
