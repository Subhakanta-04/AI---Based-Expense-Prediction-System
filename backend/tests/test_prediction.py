"""
Unit tests for expense prediction and forecasting.
"""
import unittest
from backend.app.services.prediction_service import prediction_service
from backend.app.services.forecast_service import forecast_service

class TestPrediction(unittest.TestCase):
    def test_single_prediction(self):
        payload = {
            "Date": "2024-07-01",
            "Category": "Food",
            "Payment_Method": "UPI",
            "Description": "Dinner"
        }
        res = prediction_service.predict_expense(payload)
        self.assertIn("predicted_amount", res)
        self.assertGreater(res["predicted_amount"], 0)
        self.assertIn("typical_range", res)
        self.assertLessEqual(res["typical_range"]["lower"], res["predicted_amount"])

    def test_multi_day_forecast(self):
        forecast = forecast_service.get_forecast(days=7)
        self.assertIn("next_7_days", forecast)
        self.assertEqual(len(forecast["next_7_days"]["records"]), 7)
        self.assertGreater(forecast["next_7_days"]["total_spending"], 0)

if __name__ == "__main__":
    unittest.main()
