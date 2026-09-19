"""
Game Theoretic Formulation of Mediocrity Consensus vs Excellence in Closed Micro-Communities.
"""

from dataclasses import dataclass
from typing import Dict, Tuple, List


@dataclass
class PayoffMatrix:
    """
    2x2 Strategic Form Game between Ingroup Peer (P1) and Focal Actor (P2)
    Strategies:
      - Conform (C): Maintain baseline mediocrity
      - Strive (S): Pursue excellence / outlier performance
    """
    # Format: (P1 Payoff, P2 Payoff)
    conform_conform: Tuple[float, float]
    conform_strive: Tuple[float, float]
    strive_conform: Tuple[float, float]
    strive_strive: Tuple[float, float]

    def to_dict(self) -> Dict:
        return {
            "Conform_Conform": self.conform_conform,
            "Conform_Strive": self.conform_strive,
            "Strive_Conform": self.strive_conform,
            "Strive_Strive": self.strive_strive,
        }


class MediocrityGame:
    """
    Analyzes the payoff dynamics and Nash Equilibria under different institutional reward structures:
    1. Closed Havza (High Envy, High Peer Punishment, Low Macro Mobility)
    2. Open Meritocracy (High Macro Mobility, Merit-Based Rewards)
    """

    def __init__(
        self,
        base_effort_cost: float = 2.0,
        merit_reward: float = 5.0,
        envy_cost: float = 3.5,
        peer_punishment_cost: float = 4.0,
        social_approval_reward: float = 2.5,
    ):
        self.base_effort_cost = base_effort_cost
        self.merit_reward = merit_reward
        self.envy_cost = envy_cost
        self.peer_punishment_cost = peer_punishment_cost
        self.social_approval_reward = social_approval_reward

        # Aliases
        self.c = base_effort_cost
        self.r = merit_reward
        self.e = envy_cost
        self.p = peer_punishment_cost
        self.a = social_approval_reward

    def build_closed_havza_matrix(self) -> PayoffMatrix:
        """
        In a closed havza without external mobility:
        - (C, C): Both relax -> (a, a)
        - (C, S): Peer feels envy (a - e), Striver is punished (-c + r - p)
        - (S, C): Striver is punished (-c + r - p), Peer feels envy (a - e)
        - (S, S): Both compete hard (-c + r, -c + r)
        """
        return PayoffMatrix(
            conform_conform=(self.a, self.a),
            conform_strive=(self.a - self.e, self.r - self.c - self.p),
            strive_conform=(self.r - self.c - self.p, self.a - self.e),
            strive_strive=(self.r - self.c, self.r - self.c),
        )

    def solve_nash_equilibria(self, matrix: PayoffMatrix) -> List[str]:
        """
        Finds pure strategy Nash Equilibria.
        """
        equilibria = []

        # Check (C, C)
        # P1: CC[0] >= SC[0], P2: CC[1] >= CS[1]
        if matrix.conform_conform[0] >= matrix.strive_conform[0] and matrix.conform_conform[1] >= matrix.conform_strive[1]:
            equilibria.append("Conform-Conform (Mediocrity Consensus)")

        # Check (S, S)
        if matrix.strive_strive[0] >= matrix.conform_strive[0] and matrix.strive_strive[1] >= matrix.strive_conform[1]:
            equilibria.append("Strive-Strive (Collective Excellence)")

        # Check Asymmetric (C, S) or (S, C)
        if matrix.conform_strive[0] >= matrix.strive_strive[0] and matrix.conform_strive[1] >= matrix.conform_conform[1]:
            equilibria.append("Conform-Strive (Exploitative Asymmetry)")
        if matrix.strive_conform[0] >= matrix.conform_conform[0] and matrix.strive_conform[1] >= matrix.strive_strive[1]:
            equilibria.append("Strive-Conform (Asymmetric Outlier Friction)")

        return equilibria

    def evolutionary_stability(self) -> Dict[str, float]:
        """
        Computes the evolutionary stable strategy (ESS) population ratio for Striving vs Conforming.
        """
        numerator = self.a - self.r + self.c + self.p
        denominator = self.p + self.e
        critical_threshold = max(0.0, min(1.0, numerator / denominator)) if denominator != 0 else 0.0

        return {
            "critical_outlier_mass_required_for_norm_shift": round(critical_threshold, 3),
            "mediocrity_trap_strength": "HIGH" if critical_threshold > 0.6 else "MODERATE",
        }
