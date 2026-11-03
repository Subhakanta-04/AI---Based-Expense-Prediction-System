"""
Unit tests for anomaly detection.
"""
import unittest
from backend.app.services.anomaly_service import anomaly_service

class TestAnomaly(unittest.TestCase):
    def test_anomaly_detection(self):
        res = anomaly_service.get_anomalies()
        self.assertIn("anomaly_count", res)
        self.assertIn("anomalies", res)
        self.assertGreater(res["anomaly_count"], 0)
        
        # Verify highest anomaly is indeed significant
        highest = res["anomalies"][0]
        self.assertGreater(highest["amount"], 2000)

if __name__ == "__main__":
    unittest.main()
