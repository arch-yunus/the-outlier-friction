"""
The Outlier Friction - Simulation and Mathematical Modeling Suite
"""

__version__ = "1.0.0"
__author__ = "The Outlier Friction Contributors"

from .agent import Agent, AgentState
from .game_theory import MediocrityGame, PayoffMatrix
from .simulation import CommunitySimulation, SimulationMetrics

__all__ = [
    "Agent",
    "AgentState",
    "MediocrityGame",
    "PayoffMatrix",
    "CommunitySimulation",
    "SimulationMetrics",
]
