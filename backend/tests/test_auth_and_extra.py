"""
Unit tests for Authentication, Budget Targets, and Scenario Simulation.
"""
import unittest
from backend.app.services.auth_service import auth_service
from backend.app.services.budget_service import budget_service
from backend.app.services.scenario_service import scenario_service

class TestAuthAndExtraFeatures(unittest.TestCase):
    def test_demo_login(self):
        res = auth_service.login("admin@fyte.ai", "admin123")
        self.assertIn("user", res)
        self.assertEqual(res["user"]["email"], "admin@fyte.ai")
        self.assertIn("token", res)

    def test_token_verification(self):
        res = auth_service.login("admin@fyte.ai", "admin123")
        verified = auth_service.verify_token(res["token"])
        self.assertIsNotNone(verified)
        self.assertEqual(verified["email"], "admin@fyte.ai")

    def test_budget_status(self):
        status = budget_service.get_budget_status()
        self.assertIn("total_budget", status)
        self.assertGreater(len(status["categories"]), 0)
        self.assertIn("status_level", status["categories"][0])

    def test_scenario_simulation(self):
        sim = scenario_service.simulate_scenario(cut_food_pct=20, cut_shopping_pct=25)
        self.assertIn("projected_monthly_savings", sim)
        self.assertGreaterEqual(sim["projected_monthly_savings"], 0)
        self.assertIn("category_savings", sim)

if __name__ == "__main__":
    unittest.main()
