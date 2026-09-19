"""
Command-Line Interface for The Outlier Friction Suite.
"""

import argparse
import json
import sys
import io
from .simulation import CommunitySimulation
from .game_theory import MediocrityGame

# Configure stdout encoding safely
if sys.stdout.encoding and "utf" not in sys.stdout.encoding.lower():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def render_ascii_bar(val: float, max_val: float = 10.0, length: int = 15) -> str:
    filled = int((min(val, max_val) / max_val) * length)
    return "[" + "#" * filled + "." * (length - filled) + "]"


def run_ofi_questionnaire():
    print("\n=======================================================")
    print("  OUTLIER FRICTION INDEX (OFI) - DIAGNOSTIC ENGINE")
    print("=======================================================")
    print("Rate the following from 1 (Never/Low) to 5 (Always/High):\n")

    questions = [
        "1. Do peers make sarcastic remarks when you work outside standard expectations?",
        "2. Is there an unspoken consensus to exert only the minimum required effort?",
        "3. Have you noticed conversations suddenly pausing or whispering when you enter a room?",
        "4. Are project opportunities or information channels withheld informally?",
        "5. When you raise concerns, are you told 'You are oversensitive / It is all in your head'?",
        "6. Does striving for higher quality lead to peer friction rather than encouragement?",
        "7. Is the community socially and physically closed (high friction to exit)?",
        "8. Do peers show solidarity when a member underperforms, but hostility when one excels?",
        "9. Do you feel a physical or psychological urge to downplay your achievements?",
        "10. Have you experienced sudden collective silence (ostracism) following disagreement?",
    ]

    total_score = 0
    for q in questions:
        while True:
            try:
                user_input = input(f"{q} [1-5]: ").strip()
                val = int(user_input)
                if 1 <= val <= 5:
                    total_score += val
                    break
                print("Please enter a number between 1 and 5.")
            except (ValueError, EOFError):
                val = 3
                total_score += val
                print(f"Defaulting to {val}")
                break

    print("\n-------------------------------------------------------")
    print(f"  TOTAL OFI SCORE: {total_score} / 50")
    print("-------------------------------------------------------")

    if total_score < 20:
        status = "LOW FRICTION (Healthy Environment)"
        strategy = "Continue active collaboration; voice concerns constructively."
    elif total_score < 32:
        status = "MODERATE FRICTION (Latent Envy & Conformity Pressure)"
        strategy = "Maintain tactical distance; build external peer connections."
    elif total_score < 42:
        status = "SEVERE MOBBING / LATERAL VIOLENCE (Active Cabal & Ridicule)"
        strategy = "Cease emotional investment; do not explain or defend. Apply Hirschman Exit strategy."
    else:
        status = "CRITICAL OSTRACISM TRAP (Nerve Hazard / Total Alienation)"
        strategy = "IMMEDIATE EXIT. Channel 100% of creative energy to macro-ecosystems outside this closed havza."

    print(f"Status:   {status}")
    print(f"Strategy: {strategy}")
    print("=======================================================\n")


def main():
    parser = argparse.ArgumentParser(
        description="The Outlier Friction: Socio-Psychological Simulation & Game Theoretic Analysis"
    )
    parser.add_argument("--agents", type=int, default=16, help="Total number of agents")
    parser.add_argument("--outliers", type=int, default=1, help="Number of outlier agents")
    parser.add_argument("--steps", type=int, default=45, help="Simulation steps to run")
    parser.add_argument("--conformity", type=float, default=0.8, help="Conformity bias (0.0 to 1.0)")
    parser.add_argument("--envy", type=float, default=0.7, help="Envy multiplier (0.0 to 1.0)")
    parser.add_argument("--game-theory", action="store_true", help="Analyze Mediocrity Game Theory equilibria")
    parser.add_argument("--ofi", action="store_true", help="Run Outlier Friction Index diagnostic questionnaire")
    parser.add_argument("--export-json", type=str, default=None, help="Path to export simulation JSON")

    args = parser.parse_args()

    if args.ofi:
        run_ofi_questionnaire()
        return

    if args.game_theory:
        print("\n=======================================================")
        print("  GAME THEORETIC PAYOFF MATRIX: CLOSED HAVZA MODEL")
        print("=======================================================")
        game = MediocrityGame()
        matrix = game.build_closed_havza_matrix()
        print(f"  (Conform, Conform): Peer={matrix.conform_conform[0]:.1f}, Outlier={matrix.conform_conform[1]:.1f}")
        print(f"  (Conform, Strive):  Peer={matrix.conform_strive[0]:.1f}, Outlier={matrix.conform_strive[1]:.1f}")
        print(f"  (Strive, Conform):  Peer={matrix.strive_conform[0]:.1f}, Outlier={matrix.strive_conform[1]:.1f}")
        print(f"  (Strive, Strive):   Peer={matrix.strive_strive[0]:.1f}, Outlier={matrix.strive_strive[1]:.1f}")
        print("-------------------------------------------------------")
        eqs = game.solve_nash_equilibria(matrix)
        print("  Pure Strategy Nash Equilibria:")
        for eq in eqs:
            print(f"   -> {eq}")
        ess = game.evolutionary_stability()
        print(f"  Critical Outlier Mass Required to Break Mediocrity: {ess['critical_outlier_mass_required_for_norm_shift']*100:.1f}%")
        print(f"  Mediocrity Trap Rigidity: {ess['mediocrity_trap_strength']}")
        print("=======================================================\n")
        return

    print("\n===================================================================================")
    print("  THE OUTLIER FRICTION: MULTI-AGENT COMMUNITY SIMULATION")
    print(f"  Agents: {args.agents} | Outliers: {args.outliers} | Conformity: {args.conformity} | Envy: {args.envy}")
    print("===================================================================================\n")

    sim = CommunitySimulation(
        n_agents=args.agents,
        n_outliers=args.outliers,
        conformity_bias=args.conformity,
        envy_multiplier=args.envy,
    )

    print(f"{'Step':<6} | {'Phase':<24} | {'Comm Energy':<12} | {'dACC Stress':<24} | {'Active Links':<12} | {'Isolation'}")
    print("-" * 96)

    for s in range(args.steps):
        m = sim.step()
        if s % 5 == 0 or s == args.steps - 1 or "Exit" in m.active_phase:
            bar = render_ascii_bar(m.avg_dacc_stress_outliers, 10.0, 15)
            print(
                f"{m.step:<6} | {m.active_phase:<24} | {m.schachter_comm_energy:<12.2f} | "
                f"{m.avg_dacc_stress_outliers:<5.2f} {bar:<17} | {m.active_edges_count:<12} | {m.outlier_isolation_ratio*100:>5.1f}%"
            )

    print("\n-----------------------------------------------------------------------------------")
    summary = sim.export_summary()
    print(f"Simulation Concluded. Final State of Outlier(s): {summary['outlier_final_states']}")
    print(f"Final dACC Neurological Stress: {summary['final_avg_dacc_stress']} / 10.0")
    print("===================================================================================\n")

    if args.export_json:
        with open(args.export_json, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)
        print(f"Simulation summary successfully saved to: {args.export_json}")


if __name__ == "__main__":
    main()
