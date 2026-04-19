"""
TravelLens — Recommendation System Performance Metrics
Run: python performance_metrics.py

Measures:
  - Precision@K
  - Recall@K
  - Coverage
  - Diversity (Intra-list diversity)
  - Novelty
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from collections import defaultdict
import warnings
warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────
# DB CONNECTION
# ─────────────────────────────────────────────
DB_URL = "mysql+pymysql://root:HRSD%4019es@localhost/travellens"
engine = create_engine(DB_URL)

print("=" * 60)
print("   TravelLens — Recommendation System Performance Metrics")
print("=" * 60)


def load_data():
    """Load all relevant tables from DB"""
    with engine.connect() as conn:
        users     = pd.read_sql("SELECT * FROM users", conn)
        trips     = pd.read_sql("SELECT * FROM trips", conn)
        places    = pd.read_sql("SELECT * FROM places", conn)
        expenses  = pd.read_sql("SELECT * FROM expenses", conn)
        hotels    = pd.read_sql("SELECT * FROM hotels", conn)

    print(f"\n📦 Data Loaded:")
    print(f"   Users    : {len(users)}")
    print(f"   Trips    : {len(trips)}")
    print(f"   Places   : {len(places)}")
    print(f"   Expenses : {len(expenses)}")
    print(f"   Hotels   : {len(hotels)}")

    return users, trips, places, expenses, hotels


# ─────────────────────────────────────────────
# BUILD USER-ITEM INTERACTION MATRIX
# ─────────────────────────────────────────────
def build_interaction_matrix(trips, places):
    """
    User → destinations visited (implicit feedback)
    Each (user_id, destination) pair = 1 interaction
    """
    merged = trips[["id", "user_id", "destination"]].copy()
    merged.columns = ["trip_id", "user_id", "destination"]

    # Count visits per user per destination
    interactions = merged.groupby(["user_id", "destination"]).size().reset_index(name="visits")

    # Pivot to matrix
    matrix = interactions.pivot_table(
        index="user_id",
        columns="destination",
        values="visits",
        fill_value=0
    )

    print(f"\n📊 Interaction Matrix: {matrix.shape[0]} users × {matrix.shape[1]} destinations")
    return matrix, interactions


# ─────────────────────────────────────────────
# SIMPLE COLLABORATIVE FILTER (for evaluation)
# ─────────────────────────────────────────────
def simple_recommend(user_id, matrix, interactions, top_k=5):
    """
    User-based collaborative filtering:
    Find similar users → recommend destinations they visited but target hasn't
    """
    if user_id not in matrix.index:
        return []

    user_vec = matrix.loc[user_id].values.astype(float)
    scores = {}

    for other_id in matrix.index:
        if other_id == user_id:
            continue
        other_vec = matrix.loc[other_id].values.astype(float)

        # Cosine similarity
        denom = np.linalg.norm(user_vec) * np.linalg.norm(other_vec)
        if denom == 0:
            continue
        sim = np.dot(user_vec, other_vec) / denom

        # Destinations this user visited but target hasn't
        target_visited = set(interactions[interactions.user_id == user_id]["destination"])
        other_visited  = set(interactions[interactions.user_id == other_id]["destination"])
        new_places = other_visited - target_visited

        for place in new_places:
            scores[place] = scores.get(place, 0) + sim

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [r[0] for r in ranked[:top_k]]


# ─────────────────────────────────────────────
# METRIC 1: PRECISION@K & RECALL@K
# (Leave-one-out evaluation)
# ─────────────────────────────────────────────
def evaluate_precision_recall(interactions, matrix, K=5):
    """
    Leave-one-out: hide last trip destination per user,
    check if recommendation list contains it.
    """
    print("\n" + "─" * 60)
    print("📐 Metric 1: Precision@K & Recall@K (Leave-One-Out)")
    print("─" * 60)

    user_destinations = interactions.groupby("user_id")["destination"].apply(list).to_dict()

    precisions, recalls = [], []
    results = []

    for user_id, destinations in user_destinations.items():
        if len(destinations) < 2:
            continue  # Need at least 2 to leave one out

        # Hold out last destination
        held_out   = destinations[-1]
        train_dest = destinations[:-1]

        # Temporarily mask held-out destination in matrix
        temp_matrix = matrix.copy()
        if held_out in temp_matrix.columns:
            temp_matrix.loc[user_id, held_out] = 0

        recs = simple_recommend(user_id, temp_matrix, interactions[interactions.destination != held_out], top_k=K)

        hit = 1 if held_out in recs else 0
        precision = hit / K
        recall    = hit / 1  # 1 relevant item held out

        precisions.append(precision)
        recalls.append(recall)
        results.append({
            "user_id"   : user_id,
            "held_out"  : held_out,
            "hit"       : "✅" if hit else "❌",
            "recs"      : ", ".join(recs) if recs else "—"
        })

    df_results = pd.DataFrame(results)
    if not df_results.empty:
        print(df_results.to_string(index=False))

    avg_precision = np.mean(precisions) if precisions else 0
    avg_recall    = np.mean(recalls) if recalls else 0

    print(f"\n   Precision@{K} : {avg_precision:.4f}  ({avg_precision*100:.1f}%)")
    print(f"   Recall@{K}    : {avg_recall:.4f}  ({avg_recall*100:.1f}%)")

    if avg_precision + avg_recall > 0:
        f1 = 2 * avg_precision * avg_recall / (avg_precision + avg_recall)
        print(f"   F1 Score     : {f1:.4f}")

    return avg_precision, avg_recall


# ─────────────────────────────────────────────
# METRIC 2: CATALOG COVERAGE
# ─────────────────────────────────────────────
def evaluate_coverage(interactions, matrix, K=5):
    """
    What % of all destinations can the system recommend?
    """
    print("\n" + "─" * 60)
    print("📦 Metric 2: Catalog Coverage")
    print("─" * 60)

    all_destinations = set(interactions["destination"].unique())
    recommended_set  = set()

    for user_id in matrix.index:
        recs = simple_recommend(user_id, matrix, interactions, top_k=K)
        recommended_set.update(recs)

    coverage = len(recommended_set) / len(all_destinations) if all_destinations else 0

    print(f"   Total destinations in catalog : {len(all_destinations)}")
    print(f"   Destinations ever recommended : {len(recommended_set)}")
    print(f"   Coverage                      : {coverage:.4f}  ({coverage*100:.1f}%)")
    print(f"   Recommended destinations      : {', '.join(sorted(recommended_set)) if recommended_set else '—'}")

    return coverage


# ─────────────────────────────────────────────
# METRIC 3: DIVERSITY (Intra-List)
# ─────────────────────────────────────────────
def evaluate_diversity(interactions, trips, matrix, K=5):
    """
    How different are the recommendations within a single list?
    Uses travel_type and destination as features.
    """
    print("\n" + "─" * 60)
    print("🌈 Metric 3: Intra-List Diversity")
    print("─" * 60)

    dest_travel_type = trips.groupby("destination")["travel_type"].agg(
        lambda x: x.mode()[0] if len(x) > 0 else "Unknown"
    ).to_dict()

    diversities = []

    for user_id in matrix.index:
        recs = simple_recommend(user_id, matrix, interactions, top_k=K)
        if len(recs) < 2:
            continue

        types = [dest_travel_type.get(r, "Unknown") for r in recs]
        unique_types = len(set(types))
        diversity = unique_types / len(types)
        diversities.append(diversity)

    avg_diversity = np.mean(diversities) if diversities else 0
    print(f"   Avg Intra-List Diversity : {avg_diversity:.4f}  ({avg_diversity*100:.1f}%)")
    print(f"   (1.0 = all different types, 0.0 = all same type)")

    return avg_diversity


# ─────────────────────────────────────────────
# METRIC 4: NOVELTY
# ─────────────────────────────────────────────
def evaluate_novelty(interactions, matrix, K=5):
    """
    How popular are recommended items?
    Less popular = more novel.
    """
    print("\n" + "─" * 60)
    print("✨ Metric 4: Novelty (Popularity Bias)")
    print("─" * 60)

    total_users = len(matrix.index)
    dest_popularity = interactions.groupby("destination")["user_id"].nunique() / total_users

    novelties = []

    for user_id in matrix.index:
        recs = simple_recommend(user_id, matrix, interactions, top_k=K)
        if not recs:
            continue

        item_novelties = []
        for rec in recs:
            pop = dest_popularity.get(rec, 0)
            if pop > 0:
                item_novelties.append(-np.log2(pop))  # self-information
        if item_novelties:
            novelties.append(np.mean(item_novelties))

    avg_novelty = np.mean(novelties) if novelties else 0
    print(f"   Avg Novelty Score : {avg_novelty:.4f}")
    print(f"   (Higher = recommending less popular / more niche destinations)")

    # Show popularity of each destination
    print(f"\n   Destination Popularity:")
    for dest, pop in dest_popularity.sort_values(ascending=False).items():
        bar = "█" * int(pop * 20)
        print(f"   {dest:<25} {bar:<20} {pop*100:.0f}% of users visited")

    return avg_novelty


# ─────────────────────────────────────────────
# METRIC 5: BUDGET FIT SCORE
# ─────────────────────────────────────────────
def evaluate_budget_fit(users, trips, expenses):
    """
    How well do actual trip costs match user budgets?
    """
    print("\n" + "─" * 60)
    print("💰 Metric 5: Budget Fit Score")
    print("─" * 60)

    trip_spend = expenses.groupby("trip_id")["amount"].sum().reset_index()
    trip_spend.columns = ["trip_id", "actual_spend"]

    merged = trips.merge(trip_spend, left_on="id", right_on="trip_id", how="left")
    merged = merged.merge(users[["id", "name"]], left_on="user_id", right_on="id", how="left")
    merged["actual_spend"] = merged["actual_spend"].fillna(0)
    merged["budget_utilization"] = merged["actual_spend"] / merged["budget"].replace(0, np.nan)
    merged["within_budget"] = merged["actual_spend"] <= merged["budget"]

    print(f"\n   {'User':<15} {'Trip':<25} {'Budget':>10} {'Spent':>10} {'Util%':>8} {'Status':>10}")
    print(f"   {'─'*15} {'─'*25} {'─'*10} {'─'*10} {'─'*8} {'─'*10}")

    for _, row in merged.iterrows():
        status = "✅ OK" if row["within_budget"] else "⚠️  Over"
        util   = f"{row['budget_utilization']*100:.0f}%" if pd.notna(row["budget_utilization"]) else "N/A"
        print(f"   {str(row['name']):<15} {str(row['trip_name']):<25} ₹{row['budget']:>8,.0f} ₹{row['actual_spend']:>8,.0f} {util:>8} {status:>10}")

    avg_util = merged["budget_utilization"].mean()
    pct_within = merged["within_budget"].mean() * 100
    print(f"\n   Avg Budget Utilization : {avg_util*100:.1f}%")
    print(f"   Trips within budget    : {pct_within:.0f}%")

    return avg_util


# ─────────────────────────────────────────────
# SUMMARY REPORT
# ─────────────────────────────────────────────
def print_summary(precision, recall, coverage, diversity, novelty, budget_util):
    print("\n" + "=" * 60)
    print("   📋 PERFORMANCE METRICS SUMMARY")
    print("=" * 60)

    def rating(score, thresholds):
        if score >= thresholds[0]: return "🟢 Good"
        if score >= thresholds[1]: return "🟡 Fair"
        return "🔴 Needs Work"

    print(f"   Precision@5       : {precision*100:>6.1f}%   {rating(precision, [0.3, 0.1])}")
    print(f"   Recall@5          : {recall*100:>6.1f}%   {rating(recall, [0.3, 0.1])}")
    print(f"   Coverage          : {coverage*100:>6.1f}%   {rating(coverage, [0.5, 0.25])}")
    print(f"   Diversity         : {diversity*100:>6.1f}%   {rating(diversity, [0.6, 0.3])}")
    print(f"   Novelty Score     : {novelty:>6.2f}     {'🟢 Good' if novelty > 1 else '🟡 Fair'}")
    print(f"   Budget Fit        : {budget_util*100:>6.1f}%   {rating(1 - abs(1 - budget_util), [0.8, 0.5])}")
    print("=" * 60)
    print("\n⚠️  Note: Metrics are based on available DB data.")
    print("   More users & trips = more reliable scores.\n")


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    try:
        users, trips, places, expenses, hotels = load_data()
        matrix, interactions = build_interaction_matrix(trips, places)

        K = 5
        precision, recall = evaluate_precision_recall(interactions, matrix, K)
        coverage           = evaluate_coverage(interactions, matrix, K)
        diversity          = evaluate_diversity(interactions, trips, matrix, K)
        novelty            = evaluate_novelty(interactions, matrix, K)
        budget_util        = evaluate_budget_fit(users, trips, expenses)

        print_summary(precision, recall, coverage, diversity, novelty, budget_util)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()