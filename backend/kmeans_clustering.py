"""
TravelLens — K-Means Clustering Analysis
Run: python kmeans_clustering.py

Clusters:
  1. Users by travel behavior
  2. Trips by spending patterns
  3. Places by category and ratings
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.cm as cm
from sqlalchemy import create_engine
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
import warnings
warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────
# DB CONNECTION
# ─────────────────────────────────────────────
DB_URL = "mysql+pymysql://travellens_user:travel123@localhost/travellens"
engine = create_engine(DB_URL)

OUTPUT_DIR = "clustering_output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("=" * 60)
print("   TravelLens — K-Means Clustering Analysis")
print("=" * 60)


def load_data():
    with engine.connect() as conn:
        users    = pd.read_sql("SELECT * FROM users", conn)
        trips    = pd.read_sql("SELECT * FROM trips", conn)
        places   = pd.read_sql("SELECT * FROM places", conn)
        expenses = pd.read_sql("SELECT * FROM expenses", conn)
        hotels   = pd.read_sql("SELECT * FROM hotels", conn)
    return users, trips, places, expenses, hotels


def best_k(X_scaled, k_range=range(2, 6), label=""):
    """Find best K using silhouette score"""
    if len(X_scaled) <= 2:
        return 2

    scores = {}
    for k in k_range:
        if k >= len(X_scaled):
            continue
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X_scaled)
        if len(set(labels)) < 2:
            continue
        scores[k] = silhouette_score(X_scaled, labels)

    if not scores:
        return 2

    best = max(scores, key=scores.get)
    print(f"   Silhouette scores for {label}: {scores}")
    print(f"   → Best K = {best} (score: {scores[best]:.3f})")
    return best


def save_plot(fig, filename):
    path = os.path.join(OUTPUT_DIR, filename)
    fig.savefig(path, bbox_inches="tight", dpi=150)
    plt.close(fig)
    print(f"   💾 Saved: {path}")


# ─────────────────────────────────────────────
# CLUSTER 1: USERS BY TRAVEL BEHAVIOR
# ─────────────────────────────────────────────
def cluster_users(users, trips, expenses):
    print("\n" + "─" * 60)
    print("👥 Cluster 1: Users by Travel Behavior")
    print("─" * 60)

    # Features per user
    trip_counts    = trips.groupby("user_id").size().rename("trip_count")
    avg_budget     = trips.groupby("user_id")["budget"].mean().rename("avg_budget")
    total_spend    = expenses.merge(trips[["id", "user_id"]], left_on="trip_id", right_on="id")
    total_spend    = total_spend.groupby("user_id")["amount"].sum().rename("total_spend")
    avg_trip_days  = trips.copy()
    avg_trip_days["days"] = (
        pd.to_datetime(avg_trip_days["end_date"]) -
        pd.to_datetime(avg_trip_days["start_date"])
    ).dt.days
    avg_days = avg_trip_days.groupby("user_id")["days"].mean().rename("avg_trip_days")

    # Travel type encoding
    le = LabelEncoder()
    trips["travel_type_enc"] = le.fit_transform(trips["travel_type"].fillna("Solo"))
    travel_type_mode = trips.groupby("user_id")["travel_type_enc"].agg(
        lambda x: x.mode()[0]
    ).rename("travel_type_enc")

    user_features = users[["id", "name"]].set_index("id")
    user_features = user_features.join([trip_counts, avg_budget, total_spend, avg_days, travel_type_mode])
    user_features = user_features.fillna(0)

    feature_cols = ["trip_count", "avg_budget", "total_spend", "avg_trip_days", "travel_type_enc"]
    X = user_features[feature_cols].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    k = best_k(X_scaled, label="Users")
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    user_features["cluster"] = km.fit_predict(X_scaled)

    print(f"\n   {'Name':<20} {'Trips':>6} {'Avg Budget':>12} {'Total Spend':>12} {'Avg Days':>9} {'Cluster':>8}")
    print(f"   {'─'*20} {'─'*6} {'─'*12} {'─'*12} {'─'*9} {'─'*8}")
    for name, row in user_features.iterrows():
        print(f"   {str(row['name']):<20} {row['trip_count']:>6.0f} ₹{row['avg_budget']:>10,.0f} ₹{row['total_spend']:>10,.0f} {row['avg_trip_days']:>8.1f}d  C{int(row['cluster'])}")

    # Cluster labels
    cluster_profiles = user_features.groupby("cluster")[feature_cols].mean()
    print(f"\n   Cluster Profiles:")
    cluster_names = {}
    for c, row in cluster_profiles.iterrows():
        if row["total_spend"] > cluster_profiles["total_spend"].median():
            name = f"C{c}: High Spender"
        elif row["trip_count"] > cluster_profiles["trip_count"].median():
            name = f"C{c}: Frequent Traveller"
        else:
            name = f"C{c}: Budget Traveller"
        cluster_names[c] = name
        print(f"   {name} → Avg Budget ₹{row['avg_budget']:,.0f}, Trips: {row['trip_count']:.1f}")

    # Plot
    if len(X_scaled) >= 2:
        pca = PCA(n_components=2)
        X_2d = pca.fit_transform(X_scaled)
        colors = cm.Set1(np.linspace(0, 0.8, k))

        fig, ax = plt.subplots(figsize=(8, 6))
        for c in range(k):
            mask = user_features["cluster"] == c
            ax.scatter(X_2d[mask, 0], X_2d[mask, 1],
                       color=colors[c], label=cluster_names.get(c, f"C{c}"),
                       s=200, edgecolors="white", linewidths=1.5, zorder=3)
            for idx in user_features[mask].index:
                i = user_features.index.get_loc(idx)
                ax.annotate(user_features.loc[idx, "name"],
                            (X_2d[i, 0], X_2d[i, 1]),
                            textcoords="offset points", xytext=(8, 4), fontsize=9)

        ax.set_title("User Clusters — Travel Behavior (PCA)", fontsize=13, fontweight="bold")
        ax.set_xlabel("PCA Component 1")
        ax.set_ylabel("PCA Component 2")
        ax.legend()
        ax.grid(True, alpha=0.3)
        fig.tight_layout()
        save_plot(fig, "1_user_clusters.png")

    return user_features


# ─────────────────────────────────────────────
# CLUSTER 2: TRIPS BY SPENDING PATTERNS
# ─────────────────────────────────────────────
def cluster_trips(trips, expenses, hotels):
    print("\n" + "─" * 60)
    print("✈️  Cluster 2: Trips by Spending Patterns")
    print("─" * 60)

    # Expense breakdown per trip
    cat_pivot = expenses.groupby(["trip_id", "category"])["amount"].sum().unstack(fill_value=0)
    hotel_cost = hotels.copy()
    hotel_cost["hotel_total"] = hotel_cost["cost_per_night"] * hotel_cost["nights"]
    hotel_agg = hotel_cost.groupby("trip_id")["hotel_total"].sum()

    trip_features = trips[["id", "trip_name", "destination", "budget"]].set_index("id")
    trip_features["days"] = (
        pd.to_datetime(trips.set_index("id")["end_date"]) -
        pd.to_datetime(trips.set_index("id")["start_date"])
    ).dt.days
    trip_features = trip_features.join(cat_pivot).join(hotel_agg)
    trip_features = trip_features.fillna(0)

    expense_cats = [c for c in cat_pivot.columns if c in trip_features.columns]
    feature_cols = ["budget", "days", "hotel_total"] + expense_cats
    feature_cols = [f for f in feature_cols if f in trip_features.columns]

    X = trip_features[feature_cols].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    k = best_k(X_scaled, label="Trips")
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    trip_features["cluster"] = km.fit_predict(X_scaled)

    print(f"\n   {'Trip':<28} {'Dest':<15} {'Budget':>10} {'Days':>5} {'Cluster':>8}")
    print(f"   {'─'*28} {'─'*15} {'─'*10} {'─'*5} {'─'*8}")
    for idx, row in trip_features.iterrows():
        print(f"   {str(row['trip_name']):<28} {str(row['destination']):<15} ₹{row['budget']:>8,.0f} {row['days']:>4.0f}d  C{int(row['cluster'])}")

    # Spending category chart
    if expense_cats:
        cluster_spend = trip_features.groupby("cluster")[expense_cats].mean()
        fig, ax = plt.subplots(figsize=(10, 6))
        cluster_spend.T.plot(kind="bar", ax=ax, colormap="Set2", edgecolor="white")
        ax.set_title("Avg Spending by Category per Cluster", fontsize=13, fontweight="bold")
        ax.set_xlabel("Expense Category")
        ax.set_ylabel("Avg Amount (₹)")
        ax.legend(title="Cluster", labels=[f"Cluster {c}" for c in cluster_spend.index])
        ax.tick_params(axis="x", rotation=30)
        ax.grid(axis="y", alpha=0.3)
        fig.tight_layout()
        save_plot(fig, "2_trip_spending_clusters.png")

    # Budget utilization bar
    total_exp = expenses.groupby("trip_id")["amount"].sum()
    trip_features["total_exp"] = trip_features.index.map(total_exp).fillna(0)
    trip_features["util"] = trip_features["total_exp"] / trip_features["budget"].replace(0, np.nan)

    fig, ax = plt.subplots(figsize=(12, 5))
    colors = cm.RdYlGn([min(1.0, 1.0 - abs(u - 0.85)) for u in trip_features["util"].fillna(0)])
    bars = ax.bar(range(len(trip_features)), trip_features["util"].fillna(0) * 100,
                  color=colors, edgecolor="white")
    ax.axhline(100, color="red", linestyle="--", linewidth=1.5, label="Budget limit")
    ax.set_xticks(range(len(trip_features)))
    ax.set_xticklabels(trip_features["trip_name"], rotation=30, ha="right", fontsize=8)
    ax.set_ylabel("Budget Utilization (%)")
    ax.set_title("Budget Utilization per Trip", fontsize=13, fontweight="bold")
    ax.legend()
    ax.grid(axis="y", alpha=0.3)
    fig.tight_layout()
    save_plot(fig, "3_budget_utilization.png")

    return trip_features


# ─────────────────────────────────────────────
# CLUSTER 3: PLACES BY CATEGORY & RATINGS
# ─────────────────────────────────────────────
def cluster_places(places, trips):
    print("\n" + "─" * 60)
    print("📍 Cluster 3: Places by Category & Ratings")
    print("─" * 60)

    place_data = places.copy()
    place_data["rating"] = pd.to_numeric(place_data["rating"], errors="coerce").fillna(4.0)

    le = LabelEncoder()
    place_data["category_enc"] = le.fit_transform(place_data["category"].fillna("Other"))

    # Merge destination info
    place_data = place_data.merge(trips[["id", "destination"]], left_on="trip_id", right_on="id", how="left")
    place_data["destination"] = place_data["destination"].fillna("Unknown")

    feature_cols = ["rating", "category_enc"]
    X = place_data[feature_cols].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    k = best_k(X_scaled, label="Places")
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    place_data["cluster"] = km.fit_predict(X_scaled)

    # Summary per cluster
    print(f"\n   Cluster Summary:")
    for c in sorted(place_data["cluster"].unique()):
        subset = place_data[place_data["cluster"] == c]
        top_cats = subset["category"].value_counts().head(2).index.tolist()
        avg_rating = subset["rating"].mean()
        print(f"   Cluster {c}: {len(subset)} places | Avg Rating: {avg_rating:.2f} | Top: {', '.join(top_cats)}")

    # Scatter: rating vs category colored by cluster
    fig, ax = plt.subplots(figsize=(10, 6))
    colors = cm.tab10(np.linspace(0, 0.8, k))
    for c in sorted(place_data["cluster"].unique()):
        subset = place_data[place_data["cluster"] == c]
        ax.scatter(subset["category_enc"], subset["rating"],
                   color=colors[c], label=f"Cluster {c}",
                   s=100, alpha=0.8, edgecolors="white")

    ax.set_xticks(range(len(le.classes_)))
    ax.set_xticklabels(le.classes_, rotation=30, ha="right")
    ax.set_ylabel("Rating")
    ax.set_title("Place Clusters — Category vs Rating", fontsize=13, fontweight="bold")
    ax.legend()
    ax.grid(True, alpha=0.3)
    fig.tight_layout()
    save_plot(fig, "4_place_clusters.png")

    # Category distribution pie
    fig, axes = plt.subplots(1, k, figsize=(5 * k, 5))
    if k == 1:
        axes = [axes]
    for c, ax in zip(sorted(place_data["cluster"].unique()), axes):
        subset = place_data[place_data["cluster"] == c]
        cat_counts = subset["category"].value_counts()
        ax.pie(cat_counts, labels=cat_counts.index, autopct="%1.0f%%",
               colors=plt.cm.Pastel1.colors[:len(cat_counts)])
        ax.set_title(f"Cluster {c}\n({len(subset)} places, avg ⭐{subset['rating'].mean():.2f})")
    fig.suptitle("Place Category Distribution by Cluster", fontsize=13, fontweight="bold")
    fig.tight_layout()
    save_plot(fig, "5_place_category_pies.png")

    return place_data


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    try:
        users, trips, places, expenses, hotels = load_data()

        user_clusters = cluster_users(users, trips, expenses)
        trip_clusters = cluster_trips(trips, expenses, hotels)
        place_clusters = cluster_places(places, trips)

        print("\n" + "=" * 60)
        print("   ✅ CLUSTERING COMPLETE")
        print("=" * 60)
        print(f"   Charts saved to: ./{OUTPUT_DIR}/")
        print("   Files:")
        for f in sorted(os.listdir(OUTPUT_DIR)):
            print(f"   📊 {f}")
        print()

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()