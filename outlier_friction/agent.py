import math
from enum import Enum
from typing import Dict, List, Set, Optional


class AgentState(str, Enum):
    INTEGRATED = "integrated"
    QUESTIONED = "questioned"
    RIDICULED = "ridiculed"
    CONSPIRED_AGAINST = "conspired_against"
    OSTRACIZED = "ostracized"
    EXITED = "exited"


class Agent:
    """
    Represents an individual agent in a closed micro-community.
    """

    def __init__(
        self,
        agent_id: int,
        name: str,
        is_outlier: bool = False,
        competence_delta: float = 0.0,
        conformity_drive: float = 0.7,
        envy_index: float = 0.5,
        status_anxiety: float = 0.5,
        resilience: float = 0.6,
    ):
        self.agent_id: int = agent_id
        self.name: str = name
        self.is_outlier: bool = is_outlier
        
        # Outlier competence delta: > 0 means deviating towards higher striving/excellence
        self.competence_delta: float = competence_delta if is_outlier else 0.0
        
        # Psychological attributes (0.0 to 1.0)
        self.conformity_drive: float = conformity_drive
        self.envy_index: float = envy_index
        self.status_anxiety: float = status_anxiety
        self.resilience: float = resilience
        
        # Dynamic State
        self.state: AgentState = AgentState.INTEGRATED
        self.dacc_stress: float = 0.0  # Neurological dorsal anterior cingulate cortex stress
        self.cumulative_alienation: float = 0.0
        self.connections: Set[int] = set()
        self.communication_inbox_history: List[float] = []
        self.active: bool = True

    def calculate_schachter_communication_intent(
        self, target: "Agent", phase_step: int, lambda_decay: float = 0.12
    ) -> float:
        """
        Calculates the communication energy directed towards a target agent.
        Stanley Schachter (1951) dynamic:
        Initial high pressure to conform, followed by a steep collapse to zero as divergence is confirmed.
        """
        if not target.is_outlier or target.state == AgentState.EXITED:
            return 1.0  # Baseline normal peer communication

        # Schachter communication curve: C(t) = C_0 * (1 + beta * t) * exp(-lambda * t)
        # Drops sharply once ostracism threshold is breached.
        beta = 1.8 * self.conformity_drive
        t = phase_step
        
        if target.state == AgentState.OSTRACIZED or target.state == AgentState.EXITED:
            return 0.0  # Complete communicative silence (Ostracism)

        comm_volume = (1.0 + beta * t) * math.exp(-lambda_decay * t)
        return max(0.0, comm_volume)

    def calculate_black_sheep_penalty(self, target: "Agent") -> float:
        """
        Calculates hostility/penalty toward an ingroup deviant.
        Marques, Yzerbyt & Leyens (1988) 'Black Sheep Effect':
        Deviation inside the ingroup triggers higher hostility than outgroup deviance.
        """
        if not target.is_outlier:
            return 0.0
        
        # Hostility increases with status anxiety, group conformity drive, and perceived delta
        hostility = (
            (self.conformity_drive * 0.4 + self.status_anxiety * 0.3 + self.envy_index * 0.3)
            * (1.0 + target.competence_delta)
        )
        return min(hostility, 1.0)

    def accumulate_dacc_stress(self, received_comm_ratio: float, peer_hostility: float, dt: float = 1.0):
        """
        Updates the neurological pain/stress index based on Eisenberger, Lieberman & Williams (2003).
        Social exclusion activates the dorsal anterior cingulate cortex (dACC).
        """
        if not self.active:
            return
        
        # Lack of communication + presence of lateral hostility induces pain
        ostracism_factor = max(0.0, 1.0 - received_comm_ratio)
        instant_pain = (ostracism_factor * 0.65 + peer_hostility * 0.35) * (1.0 - 0.5 * self.resilience)
        
        # Exponential moving average / stress accumulation with decay
        decay_rate = 0.15
        self.dacc_stress = (self.dacc_stress * math.exp(-decay_rate * dt)) + (instant_pain * dt * 1.5)
        self.dacc_stress = max(0.0, min(self.dacc_stress, 10.0))
        self.cumulative_alienation += instant_pain * dt

    def evaluate_hirschman_choice(self, macro_opportunity: float = 0.8, switching_cost: float = 0.3) -> str:
        """
        Evaluates Albert Hirschman's (1970) 'Exit, Voice, and Loyalty' framework.
        Utility of Exit vs Voice vs Loyalty.
        """
        u_exit = macro_opportunity - switching_cost
        u_voice = (0.2 * self.resilience) - (self.dacc_stress * 0.3)
        u_loyalty = (0.1 * self.conformity_drive) - (self.cumulative_alienation * 0.2)

        if u_exit > max(u_voice, u_loyalty) and self.dacc_stress > 3.5:
            return "EXIT"
        elif u_voice > u_loyalty and self.dacc_stress < 4.0:
            return "VOICE"
        else:
            return "LOYALTY"

    def to_dict(self) -> Dict:
        return {
            "id": self.agent_id,
            "name": self.name,
            "is_outlier": self.is_outlier,
            "competence_delta": round(self.competence_delta, 2),
            "state": self.state.value,
            "dacc_stress": round(self.dacc_stress, 3),
            "cumulative_alienation": round(self.cumulative_alienation, 3),
            "active_connections": len(self.connections),
            "resilience": round(self.resilience, 2),
        }
