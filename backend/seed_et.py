"""
Seed additional trips for TravelLens (for testing Travel Wrapped changes)
Run from backend: python seed_extra_trips.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models.user import User
from models.trip import Trip
from models.place import Place
from models.hotel import Hotel
from models.expense import Expense
from datetime import date

app = create_app()

SEED_EMAIL = "admin@gmail.com"

EXTRA_TRIPS = [
    {
        "trip_name": "Goa Monsoon Escape",
        "destination": "Goa",
        "start_date": date(2026, 8, 12),
        "end_date": date(2026, 8, 16),
        "budget": 26000.00,
        "travel_type": "Friends",
        "hotel": {
            "hotel_name": "The Hosteller Goa, Anjuna",
            "cost_per_night": 1800.00,
            "nights": 4
        },
        "places": [
            {"place_name": "Anjuna Beach", "category": "Beach", "rating": 4.5, "notes": "Calm monsoon vibe, scenic cliffs"},
            {"place_name": "Baga Beach", "category": "Beach", "rating": 4.3, "notes": "Water sports and nightlife"},
            {"place_name": "Dudhsagar Falls", "category": "Park", "rating": 4.8, "notes": "Spectacular waterfall during monsoon"},
            {"place_name": "Chapora Fort", "category": "Fort", "rating": 4.4, "notes": "Famous sunset viewpoint"},
            {"place_name": "Basilica of Bom Jesus", "category": "Historical", "rating": 4.6, "notes": "UNESCO heritage church"},
            {"place_name": "Calangute Market", "category": "Shopping", "rating": 4.2, "notes": "Souvenirs and beachwear"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 5000.00, "description": "Flight Chennai to Goa"},
            {"category": "Food", "amount": 4500.00, "description": "Seafood and beach cafes"},
            {"category": "Activities", "amount": 3500.00, "description": "Water sports and safari"},
            {"category": "Shopping", "amount": 3000.00, "description": "Souvenirs"},
            {"category": "Transport", "amount": 2000.00, "description": "Scooter rental"},
        ]
    },
    {
        "trip_name": "Leh-Ladakh High Altitude Expedition",
        "destination": "Leh-Ladakh",
        "start_date": date(2026, 9, 10),
        "end_date": date(2026, 9, 17),
        "budget": 48000.00,
        "travel_type": "Friends",
        "hotel": {
            "hotel_name": "The Grand Dragon Ladakh",
            "cost_per_night": 6200.00,
            "nights": 7
        },
        "places": [
            {"place_name": "Pangong Lake", "category": "Mountain", "rating": 4.9, "notes": "Crystal clear lake"},
            {"place_name": "Nubra Valley", "category": "Mountain", "rating": 4.8, "notes": "Sand dunes and camels"},
            {"place_name": "Khardung La Pass", "category": "Mountain", "rating": 4.7, "notes": "High altitude road"},
            {"place_name": "Shanti Stupa", "category": "Temple", "rating": 4.6, "notes": "Panoramic views"},
            {"place_name": "Leh Palace", "category": "Historical", "rating": 4.3, "notes": "Ancient palace"},
            {"place_name": "Magnetic Hill", "category": "Other", "rating": 4.2, "notes": "Optical illusion spot"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 15000.00, "description": "Flight to Leh"},
            {"category": "Food", "amount": 6000.00, "description": "Local cuisine"},
            {"category": "Activities", "amount": 7000.00, "description": "Trips and rentals"},
            {"category": "Shopping", "amount": 5000.00, "description": "Pashmina and souvenirs"},
            {"category": "Transport", "amount": 8000.00, "description": "Local taxis"},
            {"category": "Other", "amount": 2000.00, "description": "Altitude meds"},
        ]
    },
    {
        "trip_name": "Jaipur Winter Royal Escape",
        "destination": "Jaipur, Rajasthan",
        "start_date": date(2026, 12, 18),
        "end_date": date(2026, 12, 22),
        "budget": 30000.00,
        "travel_type": "Family",
        "hotel": {
            "hotel_name": "ITC Rajputana, Jaipur",
            "cost_per_night": 6000.00,
            "nights": 4
        },
        "places": [
            {"place_name": "Jal Mahal", "category": "Historical", "rating": 4.5, "notes": "Lake palace"},
            {"place_name": "Albert Hall Museum", "category": "Museum", "rating": 4.4, "notes": "Historic museum"},
            {"place_name": "Birla Mandir Jaipur", "category": "Temple", "rating": 4.6, "notes": "White marble temple"},
            {"place_name": "Bapu Bazaar", "category": "Shopping", "rating": 4.3, "notes": "Textiles and mojris"},
            {"place_name": "Jaigarh Fort", "category": "Fort", "rating": 4.5, "notes": "Historic fort"},
            {"place_name": "Chokhi Dhani", "category": "Entertainment", "rating": 4.7, "notes": "Cultural village"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 6000.00, "description": "Flight to Jaipur"},
            {"category": "Food", "amount": 5000.00, "description": "Rajasthani cuisine"},
            {"category": "Activities", "amount": 3000.00, "description": "Entries and events"},
            {"category": "Shopping", "amount": 7000.00, "description": "Handicrafts"},
            {"category": "Transport", "amount": 2000.00, "description": "Local travel"},
        ]
    }
]


def seed_extra():
    with app.app_context():
        user = User.query.filter_by(email=SEED_EMAIL).first()
        if not user:
            print("User not found")
            return

        print(f"Adding extra trips for {user.email}...")

        for t in EXTRA_TRIPS:
            trip = Trip(
                user_id=user.id,
                trip_name=t["trip_name"],
                destination=t["destination"],
                start_date=t["start_date"],
                end_date=t["end_date"],
                budget=t["budget"],
                travel_type=t["travel_type"]
            )
            db.session.add(trip)
            db.session.flush()

            h = t["hotel"]
            db.session.add(Hotel(
                trip_id=trip.id,
                hotel_name=h["hotel_name"],
                cost_per_night=h["cost_per_night"],
                nights=h["nights"]
            ))

            for p in t["places"]:
                db.session.add(Place(trip_id=trip.id, **p))

            for e in t["expenses"]:
                db.session.add(Expense(trip_id=trip.id, **e))

            print(f"Added: {t['trip_name']}")

        db.session.commit()
        print("Done! Added 3 new trips.")


if __name__ == '__main__':
    seed_extra()
