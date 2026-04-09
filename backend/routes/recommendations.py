from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.trip import Trip
from models.place import Place
from models.expense import Expense
from extensions import db
import os
import json
import random
import requests

recommendations_bp = Blueprint('recommendations', __name__)

# ─── Groq config ──────────────────────────────────────────────────────────────
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = "llama3-70b-8192"

# ─── Status ───────────────────────────────────────────────────────────────────
@recommendations_bp.route('/recommendations/status', methods=['GET'])
def status():
    return jsonify({"status": "ok"}), 200


# ─── Groq helper ──────────────────────────────────────────────────────────────
def call_groq(prompt: str) -> dict | None:
    """
    Send prompt to Groq and return parsed JSON dict,
    or None if the call fails.
    """
    if not GROQ_API_KEY:
        return None

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json",
    }

    # A small random seed injected into the system prompt forces the model to
    # produce a fresh response on every call even when the user data is identical.
    seed = random.randint(100_000, 999_999)

    system_msg = (
        "You are an expert travel advisor. "
        "Always respond ONLY with valid JSON — no markdown, no code fences, no prose. "
        f"Session-seed: {seed}"          # makes every response unique
    )

    payload = {
        "model":       GROQ_MODEL,
        "temperature": 0.9,              # higher = more varied output
        "max_tokens":  2000,
        "messages": [
            {"role": "system", "content": system_msg},
            {"role": "user",   "content": prompt},
        ],
    }

    try:
        resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        raw = resp.json()["choices"][0]["message"]["content"].strip()

        # Strip accidental markdown fences just in case
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)

    except Exception as exc:
        print(f"[Groq Error] {exc}")
        return None


# ─── Prompt builder ───────────────────────────────────────────────────────────
def build_prompt(trips: list, expenses: list) -> str:
    """
    Serialise the user's real trip history + spending into a rich prompt so
    every new trip/expense leads to a genuinely different recommendation.
    """

    # ── Trip summary ──
    if trips:
        trip_lines = []
        for t in trips:
            duration = (t.end_date - t.start_date).days if t.end_date and t.start_date else "?"
            trip_lines.append(
                f"  • {t.trip_name} → {t.destination} | {t.travel_type} | "
                f"{duration} days | budget ₹{t.budget:,.0f} | "
                f"from {t.start_date} to {t.end_date}"
            )
        trips_text = "\n".join(trip_lines)
        visited     = [t.destination for t in trips]
        travel_types = list({t.travel_type for t in trips})
        total_budget = sum(t.budget for t in trips)
        avg_budget   = total_budget / len(trips)
    else:
        trips_text   = "  (No trips logged yet — treat this user as a first-time traveller)"
        visited      = []
        travel_types = []
        avg_budget   = 0

    # ── Expense summary ──
    if expenses:
        spending: dict[str, float] = {}
        for e in expenses:
            spending[e.category] = spending.get(e.category, 0) + float(e.amount)
        spend_lines = [f"  • {cat}: ₹{amt:,.0f}" for cat, amt in spending.items()]
        spend_text  = "\n".join(spend_lines)
        top_spend   = max(spending, key=spending.get) if spending else "unknown"
    else:
        spend_text = "  (No expense data yet)"
        top_spend  = "unknown"

    prompt = f"""
You are a personalised travel recommendation engine.

=== USER TRAVEL PROFILE ===
Past trips:
{trips_text}

Expense breakdown:
{spend_text}

Already-visited destinations: {", ".join(visited) if visited else "none"}
Travel styles seen: {", ".join(travel_types) if travel_types else "unknown"}
Average trip budget: ₹{avg_budget:,.0f}
Highest-spend category: {top_spend}

=== YOUR TASK ===
Based on this profile, generate a FRESH and PERSONALISED travel recommendation.
Do NOT repeat destinations the user has already visited.
Tailor suggestions to their travel style ({", ".join(travel_types) if travel_types else "any"})
and budget range (around ₹{avg_budget:,.0f} per trip).

Return STRICTLY the following JSON structure (no extra keys, no markdown):

{{
  "destinations": [
    {{
      "name": "City, Country",
      "category": "Beach | Mountain | City | Historical | Adventure | Nature",
      "description": "2-sentence personalised pitch referencing their past travel style"
    }}
  ],
  "places": [
    {{
      "name": "Specific attraction or landmark",
      "location": "City / Region",
      "description": "One sentence on why it suits this traveller"
    }}
  ],
  "budget_tips": [
    {{
      "category": "Transport | Food | Stay | Activities | General",
      "tip": "Specific actionable tip tailored to their budget",
      "savings": "Estimated saving, e.g. ₹2,000–₹5,000"
    }}
  ],
  "next_trip_suggestions": [
    {{
      "type": "e.g. Weekend Escape | Cultural Immersion | Adventure Trek",
      "suggestion": "Destination and brief itinerary idea",
      "reason": "Why this fits their history",
      "estimated_cost": "₹XX,000 – ₹XX,000"
    }}
  ]
}}

Rules:
- Return exactly 5 destinations, 6 places, 4 budget_tips, 3 next_trip_suggestions.
- Every field must be filled — no nulls, no empty strings.
- Make descriptions specific, not generic.
- Vary the categories across the destinations list.
""".strip()

    return prompt


# ─── Main endpoint ────────────────────────────────────────────────────────────
@recommendations_bp.route('/recommendations/<int:user_id>', methods=['GET'])
@jwt_required()
def get_recommendations(user_id):
    try:
        current_user_id = int(get_jwt_identity())

        # Security: users can only fetch their own recommendations
        if current_user_id != user_id:
            return jsonify({"error": "Unauthorised"}), 403

        # ── Fetch user data ──
        trips    = Trip.query.filter_by(user_id=user_id).order_by(Trip.created_at.desc()).all()
        trip_ids = [t.id for t in trips]
        expenses = Expense.query.filter(Expense.trip_id.in_(trip_ids)).all() if trip_ids else []

        # ── Call Groq ──
        prompt = build_prompt(trips, expenses)
        recs   = call_groq(prompt)

        if recs:
            return jsonify({"recommendations": recs}), 200

        # ── Graceful fallback (Groq unavailable / key missing) ──
        visited = {t.destination for t in trips}
        fallback_destinations = [
            d for d in [
                {"name": "Manali, India",       "category": "Mountain",    "description": "Scenic Himalayan escape perfect for adventure lovers."},
                {"name": "Goa, India",           "category": "Beach",       "description": "Vibrant beaches and nightlife for group travellers."},
                {"name": "Jaipur, India",        "category": "Historical",  "description": "Royal palaces and rich Rajasthani culture."},
                {"name": "Coorg, India",         "category": "Nature",      "description": "Misty hills and coffee plantations for a peaceful retreat."},
                {"name": "Andaman Islands",      "category": "Beach",       "description": "Crystal-clear waters ideal for snorkelling and diving."},
                {"name": "Rishikesh, India",     "category": "Adventure",   "description": "White-water rafting and yoga capital of the world."},
                {"name": "Varanasi, India",      "category": "Historical",  "description": "Ancient spiritual city on the banks of the Ganges."},
            ] if d["name"] not in visited
        ][:5]

        return jsonify({
            "recommendations": {
                "destinations": fallback_destinations,
                "places": [
                    {"name": "Taj Mahal",        "location": "Agra",     "description": "UNESCO World Heritage Site."},
                    {"name": "Kerala Backwaters", "location": "Kerala",   "description": "Serene houseboat experience."},
                    {"name": "Hampi Ruins",       "location": "Karnataka","description": "Stunning Vijayanagara Empire remains."},
                    {"name": "Rann of Kutch",     "location": "Gujarat",  "description": "Spectacular salt desert, best at full moon."},
                    {"name": "Spiti Valley",      "location": "Himachal", "description": "Remote high-altitude Buddhist landscape."},
                    {"name": "Mysore Palace",     "location": "Mysore",   "description": "Magnificent Indo-Saracenic royal palace."},
                ],
                "budget_tips": [
                    {"category": "Transport", "tip": "Book train tickets on IRCTC 90 days in advance for Tatkal savings.", "savings": "₹1,000–₹3,000"},
                    {"category": "Stay",      "tip": "Use hostels or homestays instead of hotels for solo travel.",        "savings": "₹800–₹2,000/night"},
                    {"category": "Food",      "tip": "Eat at local dhabas — cheaper and more authentic.",                  "savings": "₹300–₹600/day"},
                    {"category": "General",   "tip": "Travel in shoulder season (Sept–Oct or Feb–Mar) for lower prices.", "savings": "₹5,000–₹15,000"},
                ],
                "next_trip_suggestions": [],
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500