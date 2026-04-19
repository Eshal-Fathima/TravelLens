"""
TravelLens — Extra Seed Users with Overlapping Destinations
Run: python seed_extra_users.py

Adds 6 new users with overlapping trips so collaborative filtering
can find similar users and actually recommend correctly.
✅ Does NOT touch existing users or data.
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
from decimal import Decimal

app = create_app()

# ─────────────────────────────────────────────
# EXTRA USERS — designed with overlapping destinations
# so collaborative filtering has signal to work with
#
# Overlap map:
#   Goa        → Arnald, Vidisha, Priya, Rohan, Sneha
#   Kerala     → Vidisha, Priya, Meera, Arjun
#   Manali     → Vagvedi, Rohan, Arjun, Karan
#   Ladakh     → Vagvedi, Arnald(Himachal), Karan, Rohan
#   Pondicherry→ Vagvedi, Sneha, Meera
# ─────────────────────────────────────────────

EXTRA_USERS = [
    {
        "name": "Priya Sharma",
        "email": "priya@example.com",
        "password": "priya123",
        "phone": "9811122233",
        "travel_type": "Family",
        "budget": 45000,
        "trips": [
            {
                "trip_name": "Goa Beach Holiday",
                "destination": "Goa",
                "start_date": date(2025, 4, 1),
                "end_date": date(2025, 4, 6),
                "budget": 42000,
                "travel_type": "Family",
                "hotel": {"hotel_name": "Cidade de Goa", "cost_per_night": 4800, "nights": 5},
                "places": [
                    {"place_name": "Baga Beach", "category": "Beach", "rating": 4.7, "notes": "Lovely sunrise"},
                    {"place_name": "Fort Aguada", "category": "Historical", "rating": 4.5, "notes": "Great history"},
                    {"place_name": "Anjuna Beach", "category": "Beach", "rating": 4.6, "notes": "Flea market nearby"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 7500, "description": "Flight Mumbai to Goa"},
                    {"category": "Food", "amount": 3200, "description": "Seafood meals"},
                    {"category": "Activities", "amount": 2000, "description": "Water sports"},
                    {"category": "Shopping", "amount": 2500, "description": "Souvenirs"},
                    {"category": "Stay", "amount": 24000, "description": "5 nights Cidade de Goa"},
                    {"category": "Other", "amount": 500, "description": "Miscellaneous"},
                ]
            },
            {
                "trip_name": "Kerala Family Tour",
                "destination": "Kerala",
                "start_date": date(2025, 10, 5),
                "end_date": date(2025, 10, 10),
                "budget": 38000,
                "travel_type": "Family",
                "hotel": {"hotel_name": "Kumarakom Lake Resort", "cost_per_night": 5200, "nights": 5},
                "places": [
                    {"place_name": "Alleppey Backwaters", "category": "Park", "rating": 5.0, "notes": "Houseboat amazing"},
                    {"place_name": "Munnar Tea Gardens", "category": "Park", "rating": 4.8, "notes": "Fresh tea tasting"},
                    {"place_name": "Kovalam Beach", "category": "Beach", "rating": 4.5, "notes": "Calm waves"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 8500, "description": "Flights to Kochi"},
                    {"category": "Food", "amount": 3000, "description": "Kerala cuisine"},
                    {"category": "Activities", "amount": 5500, "description": "Houseboat stay"},
                    {"category": "Shopping", "amount": 2000, "description": "Spices and tea"},
                    {"category": "Stay", "amount": 26000, "description": "5 nights resort"},
                    {"category": "Other", "amount": 400, "description": "Entry tickets"},
                ]
            },
        ]
    },

    {
        "name": "Rohan Mehta",
        "email": "rohan@example.com",
        "password": "rohan123",
        "phone": "9922233344",
        "travel_type": "Solo",
        "budget": 30000,
        "trips": [
            {
                "trip_name": "Goa Solo Trip",
                "destination": "Goa",
                "start_date": date(2025, 3, 15),
                "end_date": date(2025, 3, 19),
                "budget": 18000,
                "travel_type": "Solo",
                "hotel": {"hotel_name": "zostel Goa", "cost_per_night": 800, "nights": 4},
                "places": [
                    {"place_name": "Baga Beach", "category": "Beach", "rating": 4.6, "notes": "Nightlife great"},
                    {"place_name": "Dudhsagar Falls", "category": "Park", "rating": 4.9, "notes": "Waterfall trek"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 2500, "description": "Train to Goa"},
                    {"category": "Food", "amount": 2000, "description": "Shacks and cafes"},
                    {"category": "Activities", "amount": 1500, "description": "Jeep safari"},
                    {"category": "Stay", "amount": 3200, "description": "4 nights hostel"},
                    {"category": "Other", "amount": 300, "description": "Misc"},
                ]
            },
            {
                "trip_name": "Manali Backpacking",
                "destination": "Manali",
                "start_date": date(2025, 7, 10),
                "end_date": date(2025, 7, 16),
                "budget": 22000,
                "travel_type": "Solo",
                "hotel": {"hotel_name": "Snowflake Hostel Manali", "cost_per_night": 700, "nights": 6},
                "places": [
                    {"place_name": "Rohtang Pass", "category": "Mountain", "rating": 4.9, "notes": "Snow in July"},
                    {"place_name": "Solang Valley", "category": "Mountain", "rating": 4.8, "notes": "Paragliding"},
                    {"place_name": "Hadimba Temple", "category": "Temple", "rating": 4.6, "notes": "Peaceful"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 2800, "description": "Bus to Manali"},
                    {"category": "Food", "amount": 1800, "description": "Local dhabas"},
                    {"category": "Activities", "amount": 2200, "description": "Paragliding + snow"},
                    {"category": "Stay", "amount": 4200, "description": "6 nights hostel"},
                    {"category": "Other", "amount": 500, "description": "Permits"},
                ]
            },
            {
                "trip_name": "Ladakh Bike Trip",
                "destination": "Ladakh",
                "start_date": date(2025, 8, 20),
                "end_date": date(2025, 8, 28),
                "budget": 48000,
                "travel_type": "Solo",
                "hotel": {"hotel_name": "Stok Palace Heritage", "cost_per_night": 3500, "nights": 8},
                "places": [
                    {"place_name": "Pangong Lake", "category": "Park", "rating": 5.0, "notes": "Magical"},
                    {"place_name": "Khardung La Pass", "category": "Mountain", "rating": 4.8, "notes": "World record road"},
                    {"place_name": "Nubra Valley", "category": "Mountain", "rating": 4.9, "notes": "Sand dunes"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 10000, "description": "Flight to Leh"},
                    {"category": "Transport", "amount": 7000, "description": "Bike rental"},
                    {"category": "Food", "amount": 2500, "description": "Tibetan food"},
                    {"category": "Activities", "amount": 3000, "description": "Camping Pangong"},
                    {"category": "Stay", "amount": 28000, "description": "8 nights hotel"},
                    {"category": "Other", "amount": 800, "description": "Permits"},
                ]
            },
        ]
    },

    {
        "name": "Sneha Iyer",
        "email": "sneha@example.com",
        "password": "sneha123",
        "phone": "9733344455",
        "travel_type": "Friends",
        "budget": 25000,
        "trips": [
            {
                "trip_name": "Goa Girls Trip",
                "destination": "Goa",
                "start_date": date(2025, 12, 20),
                "end_date": date(2025, 12, 25),
                "budget": 30000,
                "travel_type": "Friends",
                "hotel": {"hotel_name": "W Goa", "cost_per_night": 3500, "nights": 5},
                "places": [
                    {"place_name": "Calangute Beach", "category": "Beach", "rating": 4.5, "notes": "Crowded but fun"},
                    {"place_name": "Basilica of Bom Jesus", "category": "Temple", "rating": 4.7, "notes": "Stunning church"},
                    {"place_name": "Baga Beach", "category": "Beach", "rating": 4.8, "notes": "Best nightlife"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 5500, "description": "Flight Chennai to Goa"},
                    {"category": "Food", "amount": 4000, "description": "Restaurants and cafes"},
                    {"category": "Activities", "amount": 2500, "description": "Water sports"},
                    {"category": "Shopping", "amount": 4000, "description": "Clothes and accessories"},
                    {"category": "Stay", "amount": 17500, "description": "5 nights W Goa"},
                    {"category": "Other", "amount": 600, "description": "Misc"},
                ]
            },
            {
                "trip_name": "Pondicherry Weekend",
                "destination": "Pondicherry",
                "start_date": date(2025, 11, 1),
                "end_date": date(2025, 11, 4),
                "budget": 12000,
                "travel_type": "Friends",
                "hotel": {"hotel_name": "Palais de Mahe", "cost_per_night": 2200, "nights": 3},
                "places": [
                    {"place_name": "Rock Beach", "category": "Beach", "rating": 4.7, "notes": "Morning jogs"},
                    {"place_name": "French Quarter", "category": "Historical", "rating": 4.6, "notes": "Photo walk"},
                    {"place_name": "Auroville", "category": "Temple", "rating": 4.8, "notes": "Peaceful vibes"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 600, "description": "Bus from Chennai"},
                    {"category": "Food", "amount": 2000, "description": "French cafes"},
                    {"category": "Activities", "amount": 500, "description": "Auroville tour"},
                    {"category": "Shopping", "amount": 1500, "description": "Handmade goods"},
                    {"category": "Stay", "amount": 6600, "description": "3 nights Palais de Mahe"},
                    {"category": "Other", "amount": 200, "description": "Misc"},
                ]
            },
        ]
    },

    {
        "name": "Meera Nair",
        "email": "meera@example.com",
        "password": "meera123",
        "phone": "9644455566",
        "travel_type": "Family",
        "budget": 40000,
        "trips": [
            {
                "trip_name": "Kerala Honeymoon",
                "destination": "Kerala",
                "start_date": date(2025, 2, 14),
                "end_date": date(2025, 2, 19),
                "budget": 55000,
                "travel_type": "Family",
                "hotel": {"hotel_name": "Leela Kovalam", "cost_per_night": 7500, "nights": 5},
                "places": [
                    {"place_name": "Alleppey Backwaters", "category": "Park", "rating": 5.0, "notes": "Romantic houseboat"},
                    {"place_name": "Varkala Beach", "category": "Beach", "rating": 4.7, "notes": "Cliffside views"},
                    {"place_name": "Munnar Tea Gardens", "category": "Park", "rating": 4.9, "notes": "Misty mornings"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 12000, "description": "Flights"},
                    {"category": "Food", "amount": 5000, "description": "Fine dining"},
                    {"category": "Activities", "amount": 8000, "description": "Houseboat + spa"},
                    {"category": "Shopping", "amount": 3000, "description": "Jewellery and spices"},
                    {"category": "Stay", "amount": 37500, "description": "5 nights Leela"},
                    {"category": "Other", "amount": 500, "description": "Misc"},
                ]
            },
            {
                "trip_name": "Pondicherry Retreat",
                "destination": "Pondicherry",
                "start_date": date(2025, 6, 1),
                "end_date": date(2025, 6, 4),
                "budget": 14000,
                "travel_type": "Family",
                "hotel": {"hotel_name": "Le Dupleix", "cost_per_night": 2500, "nights": 3},
                "places": [
                    {"place_name": "Paradise Beach", "category": "Beach", "rating": 4.5, "notes": "Ferry ride fun"},
                    {"place_name": "Manakula Vinayagar Temple", "category": "Temple", "rating": 4.4, "notes": "Elephant blessing"},
                    {"place_name": "Auroville", "category": "Temple", "rating": 4.8, "notes": "Meditation session"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 800, "description": "Bus from Chennai"},
                    {"category": "Food", "amount": 2200, "description": "French and Tamil food"},
                    {"category": "Activities", "amount": 700, "description": "Ferry + tours"},
                    {"category": "Stay", "amount": 7500, "description": "3 nights Le Dupleix"},
                    {"category": "Other", "amount": 300, "description": "Misc"},
                ]
            },
        ]
    },

    {
        "name": "Arjun Kapoor",
        "email": "arjun@example.com",
        "password": "arjun123",
        "phone": "9555566677",
        "travel_type": "Solo",
        "budget": 35000,
        "trips": [
            {
                "trip_name": "Kerala Solo Exploration",
                "destination": "Kerala",
                "start_date": date(2025, 1, 10),
                "end_date": date(2025, 1, 15),
                "budget": 28000,
                "travel_type": "Solo",
                "hotel": {"hotel_name": "Fragrant Nature Backwaters", "cost_per_night": 3200, "nights": 5},
                "places": [
                    {"place_name": "Periyar Wildlife Sanctuary", "category": "Park", "rating": 4.7, "notes": "Tiger sighting!"},
                    {"place_name": "Alleppey Backwaters", "category": "Park", "rating": 4.9, "notes": "Solo kayaking"},
                    {"place_name": "Mattancherry Palace", "category": "Historical", "rating": 4.4, "notes": "Rich art"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 6000, "description": "Train to Kerala"},
                    {"category": "Food", "amount": 2000, "description": "Local meals"},
                    {"category": "Activities", "amount": 2500, "description": "Safari + kayaking"},
                    {"category": "Stay", "amount": 16000, "description": "5 nights resort"},
                    {"category": "Other", "amount": 400, "description": "Entry fees"},
                ]
            },
            {
                "trip_name": "Manali Winter Trip",
                "destination": "Manali",
                "start_date": date(2025, 1, 20),
                "end_date": date(2025, 1, 26),
                "budget": 26000,
                "travel_type": "Solo",
                "hotel": {"hotel_name": "Solang Valley Resort", "cost_per_night": 2800, "nights": 6},
                "places": [
                    {"place_name": "Solang Valley", "category": "Mountain", "rating": 4.9, "notes": "Skiing in Jan"},
                    {"place_name": "Old Manali Market", "category": "Other", "rating": 4.3, "notes": "Cozy cafes"},
                    {"place_name": "Beas River", "category": "Park", "rating": 4.5, "notes": "Frozen banks"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 3200, "description": "Bus from Delhi"},
                    {"category": "Food", "amount": 2000, "description": "Cafe and dhabas"},
                    {"category": "Activities", "amount": 3000, "description": "Skiing and snow activities"},
                    {"category": "Stay", "amount": 16800, "description": "6 nights resort"},
                    {"category": "Other", "amount": 400, "description": "Misc"},
                ]
            },
        ]
    },

    {
        "name": "Karan Singh",
        "email": "karan@example.com",
        "password": "karan123",
        "phone": "9466677788",
        "travel_type": "Friends",
        "budget": 40000,
        "trips": [
            {
                "trip_name": "Manali with Friends",
                "destination": "Manali",
                "start_date": date(2025, 5, 20),
                "end_date": date(2025, 5, 26),
                "budget": 30000,
                "travel_type": "Friends",
                "hotel": {"hotel_name": "Johnson's Hotel Manali", "cost_per_night": 2500, "nights": 6},
                "places": [
                    {"place_name": "Rohtang Pass", "category": "Mountain", "rating": 4.8, "notes": "Snow fight!"},
                    {"place_name": "Hadimba Temple", "category": "Temple", "rating": 4.7, "notes": "Cedar forest"},
                    {"place_name": "Solang Valley", "category": "Mountain", "rating": 4.9, "notes": "Zorbing was fun"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 4000, "description": "Bus Delhi to Manali"},
                    {"category": "Food", "amount": 3000, "description": "Group meals"},
                    {"category": "Activities", "amount": 3500, "description": "Snow + zorbing"},
                    {"category": "Shopping", "amount": 2000, "description": "Woolens"},
                    {"category": "Stay", "amount": 15000, "description": "6 nights hotel"},
                    {"category": "Other", "amount": 500, "description": "Permits"},
                ]
            },
            {
                "trip_name": "Ladakh Group Expedition",
                "destination": "Ladakh",
                "start_date": date(2025, 7, 15),
                "end_date": date(2025, 7, 23),
                "budget": 55000,
                "travel_type": "Friends",
                "hotel": {"hotel_name": "Leh Palace View Hotel", "cost_per_night": 3800, "nights": 8},
                "places": [
                    {"place_name": "Pangong Lake", "category": "Park", "rating": 5.0, "notes": "Group photo iconic"},
                    {"place_name": "Nubra Valley", "category": "Mountain", "rating": 4.9, "notes": "Camel ride fun"},
                    {"place_name": "Leh Palace", "category": "Historical", "rating": 4.6, "notes": "Great views"},
                    {"place_name": "Magnetic Hill", "category": "Other", "rating": 4.3, "notes": "Mind bending"},
                ],
                "expenses": [
                    {"category": "Transport", "amount": 11000, "description": "Flights to Leh"},
                    {"category": "Transport", "amount": 6000, "description": "Shared SUV rental"},
                    {"category": "Food", "amount": 3500, "description": "Group meals"},
                    {"category": "Activities", "amount": 4000, "description": "Camping + camel ride"},
                    {"category": "Stay", "amount": 30400, "description": "8 nights hotel"},
                    {"category": "Other", "amount": 1000, "description": "Permits and tips"},
                ]
            },
        ]
    },
]


def seed():
    with app.app_context():
        added_users = 0
        skipped_users = 0

        for u_data in EXTRA_USERS:
            # Skip if user already exists
            existing = User.query.filter_by(email=u_data["email"]).first()
            if existing:
                print(f"⚠️  Skipping {u_data['email']} — already exists")
                skipped_users += 1
                continue

            # Create user
            user = User(
                name=u_data["name"],
                email=u_data["email"],
                phone=u_data["phone"],
                travel_type=u_data["travel_type"],
                budget=u_data["budget"]
            )
            user.set_password(u_data["password"])
            db.session.add(user)
            db.session.flush()

            # Add trips
            for t in u_data["trips"]:
                trip = Trip(
                    user_id=user.id,
                    trip_name=t["trip_name"],
                    destination=t["destination"],
                    start_date=t["start_date"],
                    end_date=t["end_date"],
                    budget=Decimal(t["budget"]),
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

                print(f"   ➕ {t['trip_name']}")

            added_users += 1
            print(f"✅ Added: {u_data['name']} ({u_data['email']})")

        db.session.commit()

        print(f"\n🎉 Done!")
        print(f"   Added  : {added_users} users")
        print(f"   Skipped: {skipped_users} users (already existed)")
        print(f"\n   Login credentials:")
        for u in EXTRA_USERS:
            print(f"   {u['email']:<28} / {u['password']}")


if __name__ == "__main__":
    seed()