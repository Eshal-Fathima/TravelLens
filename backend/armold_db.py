"""
Seed luxury trips for Arnald (TravelLens)
Run: python armold_db.py
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

SEED_EMAIL = "arnald@gmail.com"


TRIPS = [
    {
        "trip_name": "Swiss Alps Luxury Retreat",
        "destination": "Switzerland",
        "start_date": date(2026, 5, 10),
        "end_date": date(2026, 5, 17),
        "budget": 250000,
        "travel_type": "Solo",
        "hotel": {
            "hotel_name": "Badrutt Palace Hotel",
            "cost_per_night": 35000,
            "nights": 7
        },
        "places": [
            {"place_name": "Zermatt", "category": "Mountain", "rating": 5.0, "notes": "Luxury alpine village"},
            {"place_name": "Interlaken", "category": "Mountain", "rating": 4.9, "notes": "Adventure + scenic views"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 90000, "description": "Flights"},
            {"category": "Food", "amount": 30000, "description": "Fine dining"},
        ]
    },

    {
        "trip_name": "Tokyo Premium Escape",
        "destination": "Tokyo",
        "start_date": date(2026, 7, 8),
        "end_date": date(2026, 7, 14),
        "budget": 200000,
        "travel_type": "Solo",
        "hotel": {
            "hotel_name": "Park Hyatt Tokyo",
            "cost_per_night": 32000,
            "nights": 6
        },
        "places": [
            {"place_name": "Mt Fuji", "category": "Mountain", "rating": 5.0, "notes": "Iconic scenic view"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 70000, "description": "Flights"},
        ]
    },

    {
        "trip_name": "Maldives Private Villa Experience",
        "destination": "Maldives",
        "start_date": date(2026, 4, 12),
        "end_date": date(2026, 4, 16),
        "budget": 300000,
        "travel_type": "Solo",
        "hotel": {
            "hotel_name": "Soneva Fushi",
            "cost_per_night": 50000,
            "nights": 4
        },
        "places": [
            {"place_name": "Private Island Beach", "category": "Beach", "rating": 5.0, "notes": "Luxury experience"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 80000, "description": "Flights"},
        ]
    },

    {
        "trip_name": "Dubai Skyline Luxury",
        "destination": "Dubai",
        "start_date": date(2026, 1, 10),
        "end_date": date(2026, 1, 15),
        "budget": 180000,
        "travel_type": "Solo",
        "hotel": {
            "hotel_name": "Atlantis The Palm",
            "cost_per_night": 25000,
            "nights": 5
        },
        "places": [
            {"place_name": "Burj Khalifa", "category": "Other", "rating": 5.0, "notes": "Iconic landmark"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 60000, "description": "Flights"},
        ]
    },

    {
        "trip_name": "Bali Nature Retreat",
        "destination": "Bali",
        "start_date": date(2026, 3, 1),
        "end_date": date(2026, 3, 6),
        "budget": 150000,
        "travel_type": "Solo",
        "hotel": {
            "hotel_name": "The Kayon Resort",
            "cost_per_night": 20000,
            "nights": 5
        },
        "places": [
            {"place_name": "Ubud", "category": "Park", "rating": 4.7, "notes": "Nature aesthetic"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 50000, "description": "Flights"},
        ]
    },

    {
        "trip_name": "Andaman Luxury Beach",
        "destination": "Andaman",
        "start_date": date(2026, 8, 2),
        "end_date": date(2026, 8, 7),
        "budget": 120000,
        "travel_type": "Solo",
        "hotel": {
            "hotel_name": "Taj Exotica Resort",
            "cost_per_night": 22000,
            "nights": 5
        },
        "places": [
            {"place_name": "Radhanagar Beach", "category": "Beach", "rating": 4.9, "notes": "Clean beach"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 30000, "description": "Flights"},
        ]
    },

    {
        "trip_name": "Himachal Mountain Escape",
        "destination": "Himachal Pradesh",
        "start_date": date(2026, 9, 10),
        "end_date": date(2026, 9, 16),
        "budget": 140000,
        "travel_type": "Solo",
        "hotel": {
            "hotel_name": "The Himalayan Resort",
            "cost_per_night": 18000,
            "nights": 6
        },
        "places": [
            {"place_name": "Manali", "category": "Mountain", "rating": 4.9, "notes": "Peaceful mountains"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 25000, "description": "Travel"},
        ]
    }
]


def seed():
    with app.app_context():
        user = User.query.filter_by(email=SEED_EMAIL).first()

        # 🔥 Auto-create user if not exists
        if not user:
            print("User not found. Creating Arnald user...")

            user = User(
                name="Arnald",
                email=SEED_EMAIL,
                phone="9999999999",
                travel_type="Solo",
                budget=200000
            )
            user.set_password("arnald123")

            db.session.add(user)
            db.session.commit()

            print("✅ User created!")

        print(f"Seeding trips for {user.email}...")

        for t in TRIPS:
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
        print("🎉 Done! Data inserted successfully.")


if __name__ == "__main__":
    seed()