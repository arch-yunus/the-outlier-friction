"""
Agent-Based Modeling (ABM) of The Outlier Friction Dynamics.
Simulates Phase 1 to Phase 5 transitions, Schachter communication curves, and dACC stress metrics.
"""

import random
import math
from dataclasses import dataclass, field
from typing import List, Dict, Set, Tuple, Optional
from .agent import Agent, AgentState


@dataclass
class SimulationMetrics:
    step: int
    active_phase: str
    schachter_comm_energy: float
    avg_dacc_stress_outliers: float
    active_edges_count: int
    outlier_isolation_ratio: float
    conformity_pressure_index: float


class CommunitySimulation:
    """
    Simulates a closed micro-community experiencing the 5 phases of Outlier Friction:
    Phase 1: Radar (Detection of deviance)
    Phase 2: Ridicule (Irony, banter, downplaying)
    Phase 3: Cabal / Gossip (Backchannel alliance building)
    Phase 4: Isolation / Ostracism (Complete communicative cutoff)
    Phase 5: Liquidation / Exit (Hirschman Exit or assimilation)
    """

    PHASES = [
        "1. Radar",
        "2. Ridicule / İğneleme",
        "3. Cabal / Kulis",
        "4. Isolation / Tecrit",
        "5. Liquidation / Tasfiye",
    ]

    def __init__(
        self,
        n_agents: int = 16,
        n_outliers: int = 1,
        conformity_bias: float = 0.75,
        envy_multiplier: float = 0.65,
        macro_exit_opportunity: float = 0.8,
        seed: Optional[int] = 42,
    ):
        if seed is not None:
            random.seed(seed)

        self.n_agents = n_agents
        self.n_outliers = n_outliers
        self.conformity_bias = conformity_bias
        self.envy_multiplier = envy_multiplier
        self.macro_exit_opportunity = macro_exit_opportunity

        self.current_step = 0
        self.agents: List[Agent] = []
        self.edge_network: Set[Tuple[int, int]] = set()
        self.history: List[SimulationMetrics] = []
        
        self._init_agents()
        self._init_network()

    def _init_agents(self):
        self.agents = []
        for i in range(self.n_agents):
            is_outlier = i < self.n_outliers
            name = f"Outlier_{i+1}" if is_outlier else f"Peer_{i+1}"
            competence_delta = random.uniform(0.7, 1.0) if is_outlier else 0.0
            resilience = random.uniform(0.6, 0.9) if is_outlier else random.uniform(0.3, 0.6)
            conformity = random.uniform(0.1, 0.3) if is_outlier else random.uniform(0.6, 0.95) * self.conformity_bias
            envy = 0.1 if is_outlier else random.uniform(0.4, 0.9) * self.envy_multiplier
            status_anx = 0.2 if is_outlier else random.uniform(0.5, 0.85)

            agent = Agent(
                agent_id=i,
                name=name,
                is_outlier=is_outlier,
                competence_delta=competence_delta,
                conformity_drive=conformity,
                envy_index=envy,
                status_anxiety=status_anx,
                resilience=resilience,
            )
            self.agents.append(agent)

    def _init_network(self):
        """Initializes a dense initial network within the micro-community."""
        self.edge_network.clear()
        for i in range(self.n_agents):
            for j in range(i + 1, self.n_agents):
                # High initial connectivity in closed havza
                if random.random() < 0.85:
                    self.edge_network.add((i, j))
                    self.agents[i].connections.add(j)
                    self.agents[j].connections.add(i)

    def determine_phase(self) -> str:
        if self.current_step < 6:
            return self.PHASES[0]  # Radar
        elif self.current_step < 15:
            return self.PHASES[1]  # Ridicule
        elif self.current_step < 25:
            return self.PHASES[2]  # Cabal / Kulis
        elif self.current_step < 38:
            return self.PHASES[3]  # Isolation / Tecrit
        else:
            return self.PHASES[4]  # Liquidation / Exit

    def step(self) -> SimulationMetrics:
        self.current_step += 1
        active_phase = self.determine_phase()
        
        total_comm_energy = 0.0
        outlier_agents = [a for a in self.agents if a.is_outlier]
        peer_agents = [a for a in self.agents if not a.is_outlier]

        # 1. Update Ingroup Peer interactions toward Outlier
        for outlier in outlier_agents:
            if not outlier.active or outlier.state == AgentState.EXITED:
                continue

            # Update State based on Phase
            if "Radar" in active_phase:
                outlier.state = AgentState.QUESTIONED
            elif "Ridicule" in active_phase:
                outlier.state = AgentState.RIDICULED
            elif "Cabal" in active_phase:
                outlier.state = AgentState.CONSPIRED_AGAINST
            elif "Isolation" in active_phase:
                outlier.state = AgentState.OSTRACIZED
            elif "Liquidation" in active_phase:
                # Check Hirschman exit choice
                choice = outlier.evaluate_hirschman_choice(self.macro_exit_opportunity)
                if choice == "EXIT":
                    outlier.state = AgentState.EXITED
                    outlier.active = False

            # Communication dynamics & edge pruning
            comm_intent_sum = 0.0
            hostility_sum = 0.0
            incoming_peers_count = 0

            for peer in peer_agents:
                # Calculate Schachter communication volume
                c_intent = peer.calculate_schachter_communication_intent(
                    outlier, self.current_step
                )
                hostility = peer.calculate_black_sheep_penalty(outlier)
                comm_intent_sum += c_intent
                hostility_sum += hostility
                incoming_peers_count += 1

                # Network edge pruning during Phase 3 & 4 (Ostracism)
                edge = (min(peer.agent_id, outlier.agent_id), max(peer.agent_id, outlier.agent_id))
                if c_intent < 0.15 and edge in self.edge_network:
                    # Sever connection
                    self.edge_network.discard(edge)
                    peer.connections.discard(outlier.agent_id)
                    outlier.connections.discard(peer.agent_id)

            avg_comm_ratio = comm_intent_sum / max(1, incoming_peers_count * 2.0)
            avg_hostility = hostility_sum / max(1, incoming_peers_count)
            total_comm_energy += comm_intent_sum

            # Accumulate dACC Neurological pain
            outlier.accumulate_dacc_stress(avg_comm_ratio, avg_hostility)

        # Metrics calculation
        avg_dacc = (
            sum(o.dacc_stress for o in outlier_agents) / max(1, len(outlier_agents))
            if outlier_agents else 0.0
        )
        
        # Outlier isolation ratio (1.0 = completely isolated, 0.0 = fully connected)
        total_possible_outlier_edges = len(outlier_agents) * len(peer_agents)
        actual_outlier_edges = sum(
            1 for o in outlier_agents for p in peer_agents
            if (min(o.agent_id, p.agent_id), max(o.agent_id, p.agent_id)) in self.edge_network
        )
        isolation_ratio = (
            1.0 - (actual_outlier_edges / max(1, total_possible_outlier_edges))
        )

        metrics = SimulationMetrics(
            step=self.current_step,
            active_phase=active_phase,
            schachter_comm_energy=round(total_comm_energy, 2),
            avg_dacc_stress_outliers=round(avg_dacc, 2),
            active_edges_count=len(self.edge_network),
            outlier_isolation_ratio=round(isolation_ratio, 3),
            conformity_pressure_index=round(self.conformity_bias * (1.0 + 0.02 * self.current_step), 2),
        )
        self.history.append(metrics)
        return metrics

    def run_all(self, total_steps: int = 50) -> List[SimulationMetrics]:
        for _ in range(total_steps):
            self.step()
        return self.history

    def export_summary(self) -> Dict:
        outlier_states = {a.name: a.state.value for a in self.agents if a.is_outlier}
        return {
            "total_steps": self.current_step,
            "final_phase": self.determine_phase(),
            "outlier_final_states": outlier_states,
            "final_active_edges": len(self.edge_network),
            "final_avg_dacc_stress": round(
                sum(a.dacc_stress for a in self.agents if a.is_outlier) / max(1, self.n_outliers), 2
            ),
            "metrics_history": [m.__dict__ for m in self.history],
        }
