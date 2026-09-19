"""
Unit Tests for The Outlier Friction Simulation Suite.
"""

import unittest
from outlier_friction.agent import Agent, AgentState
from outlier_friction.game_theory import MediocrityGame, PayoffMatrix
from outlier_friction.simulation import CommunitySimulation


class TestOutlierFriction(unittest.TestCase):

    def setUp(self):
        self.peer = Agent(agent_id=1, name="Peer_1", is_outlier=False, conformity_drive=0.8, envy_index=0.7)
        self.outlier = Agent(agent_id=0, name="Outlier_1", is_outlier=True, competence_delta=0.9, resilience=0.7)

    def test_agent_schachter_communication_curve(self):
        # Step 1: Initial communication should be positive
        c_step1 = self.peer.calculate_schachter_communication_intent(self.outlier, phase_step=1)
        # Step 5: High peak pressure
        c_step5 = self.peer.calculate_schachter_communication_intent(self.outlier, phase_step=5)
        # Step 40: Drops significantly
        c_step40 = self.peer.calculate_schachter_communication_intent(self.outlier, phase_step=40)

        self.assertGreater(c_step1, 0.0)
        self.assertGreater(c_step5, c_step40)

        # In ostracized state, communication must drop to 0
        self.outlier.state = AgentState.OSTRACIZED
        c_ostracized = self.peer.calculate_schachter_communication_intent(self.outlier, phase_step=5)
        self.assertEqual(c_ostracized, 0.0)

    def test_dacc_stress_accumulation(self):
        initial_stress = self.outlier.dacc_stress
        self.assertEqual(initial_stress, 0.0)

        # Apply ostracism (0 comm ratio) and high hostility
        self.outlier.accumulate_dacc_stress(received_comm_ratio=0.0, peer_hostility=0.9)
        self.assertGreater(self.outlier.dacc_stress, 0.0)

    def test_hirschman_exit_decision(self):
        # Low stress -> Loyalty or Voice
        self.outlier.dacc_stress = 1.0
        choice_early = self.outlier.evaluate_hirschman_choice(macro_opportunity=0.9)
        self.assertIn(choice_early, ["VOICE", "LOYALTY"])

        # High stress + high macro opportunity -> EXIT
        self.outlier.dacc_stress = 6.0
        choice_late = self.outlier.evaluate_hirschman_choice(macro_opportunity=0.9)
        self.assertEqual(choice_late, "EXIT")

    def test_game_theory_mediocrity_nash_equilibrium(self):
        game = MediocrityGame()
        matrix = game.build_closed_havza_matrix()
        equilibria = game.solve_nash_equilibria(matrix)
        self.assertTrue(len(equilibria) > 0)
        self.assertIn("Conform-Conform (Mediocrity Consensus)", equilibria[0])

    def test_simulation_full_lifecycle(self):
        sim = CommunitySimulation(n_agents=10, n_outliers=1, conformity_bias=0.8, seed=42)
        history = sim.run_all(total_steps=45)

        self.assertEqual(len(history), 45)
        self.assertEqual(history[0].active_phase, "1. Radar")
        self.assertEqual(history[-1].active_phase, "5. Liquidation / Tasfiye")
        self.assertGreater(history[-1].outlier_isolation_ratio, history[0].outlier_isolation_ratio)


if __name__ == "__main__":
    unittest.main()
