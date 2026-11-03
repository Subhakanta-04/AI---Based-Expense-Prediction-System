"""
Unit tests for preprocessing and feature engineering.
"""
import unittest
import pandas as pd
from ml.src.data_loader import load_dataset
from ml.src.preprocessing import clean_data
from ml.src.feature_engineering import ExpenseFeatureEngineer

class TestPreprocessing(unittest.TestCase):
    def test_clean_data(self):
        df_raw = load_dataset("data/raw/expense_data.csv")
        df_clean, audit = clean_data(df_raw)
        self.assertEqual(len(df_clean), audit["final_rows"])
        self.assertFalse(df_clean["Date"].isnull().any())
        self.assertTrue((df_clean["Amount"] > 0).all())

    def test_feature_engineering_causality(self):
        df_raw = load_dataset("data/raw/expense_data.csv")
        df_clean, _ = clean_data(df_raw)
        engineer = ExpenseFeatureEngineer().fit(df_clean)
        df_feat = engineer.extract_features(df_clean)
        
        # Verify feature existence
        self.assertIn("Previous_Expense", df_feat.columns)
        self.assertIn("Rolling_7_Day_Average", df_feat.columns)
        self.assertIn("Is_Weekend", df_feat.columns)
        
        # Check strict causality: Previous_Expense at row 1 must equal Amount at row 0
        if len(df_clean) > 1:
            self.assertEqual(df_feat.loc[1, "Previous_Expense"], df_clean.loc[0, "Amount"])

if __name__ == "__main__":
    unittest.main()
