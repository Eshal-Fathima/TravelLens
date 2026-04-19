"""
Seed rich trip data for Vidisha and Vagvedi (TravelLens)
Run: python seed_vidisha_vagvedi.py
✅ Does NOT recreate users — only adds trips, hotels, places, expenses
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
# VIDISHA'S TRIPS
# ─────────────────────────────────────────────
VIDISHA_TRIPS = [
    {
        "trip_name": "Goa Family Trip",
        "destination": "Goa",
        "start_date": date(2025, 5, 10),
        "end_date": date(2025, 5, 15),
        "budget": 40000,
        "travel_type": "Family",
        "hotel": {
            "hotel_name": "Taj Holiday Village Resort",
            "cost_per_night": 5500,
            "nights": 5
        },
        "places": [
            {"place_name": "Baga Beach", "category": "Beach", "rating": 4.8, "notes": "Beautiful sunset spot, great for kids"},
            {"place_name": "Fort Aguada", "category": "Historical", "rating": 4.6, "notes": "16th century Portuguese fort, must visit"},
            {"place_name": "Calangute Beach", "category": "Beach", "rating": 4.5, "notes": "Busiest beach, great street food nearby"},
            {"place_name": "Basilica of Bom Jesus", "category": "Temple", "rating": 4.7, "notes": "UNESCO heritage site"},
            {"place_name": "Dudhsagar Falls", "category": "Park", "rating": 4.9, "notes": "Stunning waterfall trek, kids loved it"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 8000, "description": "Train tickets from Pune to Goa"},
            {"category": "Transport", "amount": 3500, "description": "Local taxi and auto rides"},
            {"category": "Food", "amount": 2500, "description": "Seafood dinner at Infantaria"},
            {"category": "Food", "amount": 1800, "description": "Beach shack lunch x3 days"},
            {"category": "Food", "amount": 900, "description": "Street food and snacks"},
            {"category": "Activities", "amount": 2000, "description": "Water sports — banana boat and parasailing"},
            {"category": "Activities", "amount": 1500, "description": "Dudhsagar jeep safari"},
            {"category": "Shopping", "amount": 3200, "description": "Anjuna flea market souvenirs"},
            {"category": "Shopping", "amount": 1200, "description": "Cashew and spice shopping"},
            {"category": "Stay", "amount": 27500, "description": "5 nights at Taj Holiday Village"},
            {"category": "Other", "amount": 600, "description": "Entry tickets and miscellaneous"},
        ]
    },
    {
        "trip_name": "Kerala Vacation",
        "destination": "Kerala",
        "start_date": date(2025, 8, 1),
        "end_date": date(2025, 8, 6),
        "budget": 35000,
        "travel_type": "Family",
        "hotel": {
            "hotel_name": "Spice Village Resort Munnar",
            "cost_per_night": 4800,
            "nights": 5
        },
        "places": [
            {"place_name": "Alleppey Backwaters", "category": "Park", "rating": 5.0, "notes": "Houseboat stay was magical"},
            {"place_name": "Munnar Tea Gardens", "category": "Park", "rating": 4.9, "notes": "Kids loved the tea factory tour"},
            {"place_name": "Periyar Wildlife Sanctuary", "category": "Park", "rating": 4.7, "notes": "Boat safari, spotted elephants"},
            {"place_name": "Varkala Beach", "category": "Beach", "rating": 4.6, "notes": "Cliff-top views are incredible"},
            {"place_name": "Mattancherry Palace", "category": "Historical", "rating": 4.4, "notes": "Dutch palace with Kerala murals"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 9500, "description": "Flights Pune to Kochi"},
            {"category": "Transport", "amount": 4000, "description": "Cab rental for sightseeing"},
            {"category": "Food", "amount": 2200, "description": "Traditional Kerala Sadya meal"},
            {"category": "Food", "amount": 1600, "description": "Houseboat meals included + extras"},
            {"category": "Food", "amount": 800, "description": "Coconut water and local snacks"},
            {"category": "Activities", "amount": 6500, "description": "Alleppey houseboat booking (1 night)"},
            {"category": "Activities", "amount": 1200, "description": "Periyar boat safari"},
            {"category": "Activities", "amount": 800, "description": "Tea factory tour and tasting"},
            {"category": "Shopping", "amount": 2500, "description": "Spices, tea, and handicrafts"},
            {"category": "Stay", "amount": 24000, "description": "5 nights at Spice Village Resort"},
            {"category": "Other", "amount": 500, "description": "Entry tickets and tips"},
        ]
    },
]

# ─────────────────────────────────────────────
# VAGVEDI'S TRIPS
# ─────────────────────────────────────────────
VAGVEDI_TRIPS = [
    {
        "trip_name": "Manali Solo Trip",
        "destination": "Manali",
        "start_date": date(2025, 6, 12),
        "end_date": date(2025, 6, 18),
        "budget": 25000,
        "travel_type": "Solo",
        "hotel": {
            "hotel_name": "The Himalayan Abode",
            "cost_per_night": 2200,
            "nights": 6
        },
        "places": [
            {"place_name": "Solang Valley", "category": "Mountain", "rating": 4.9, "notes": "Paragliding was insane, must do"},
            {"place_name": "Hadimba Temple", "category": "Temple", "rating": 4.7, "notes": "Ancient cedar forest temple"},
            {"place_name": "Rohtang Pass", "category": "Mountain", "rating": 4.8, "notes": "Snow in June! Breathtaking views"},
            {"place_name": "Old Manali Market", "category": "Other", "rating": 4.3, "notes": "Great cafes and local vibe"},
            {"place_name": "Beas River", "category": "Park", "rating": 4.5, "notes": "River rafting was a highlight"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 3500, "description": "Volvo bus Delhi to Manali"},
            {"category": "Transport", "amount": 2000, "description": "Bike rental for 3 days"},
            {"category": "Transport", "amount": 800, "description": "Shared cabs to Rohtang Pass"},
            {"category": "Food", "amount": 1200, "description": "Cafe 1947 and Johnson's Cafe meals"},
            {"category": "Food", "amount": 900, "description": "Street food — Siddu and Maggi"},
            {"category": "Activities", "amount": 2500, "description": "Paragliding at Solang Valley"},
            {"category": "Activities", "amount": 1500, "description": "River rafting on Beas"},
            {"category": "Activities", "amount": 800, "description": "Snow activities at Rohtang"},
            {"category": "Shopping", "amount": 1800, "description": "Woolens and Himachali cap"},
            {"category": "Stay", "amount": 13200, "description": "6 nights at The Himalayan Abode"},
            {"category": "Other", "amount": 400, "description": "Entry permits and miscellaneous"},
        ]
    },
    {
        "trip_name": "Pondicherry Chill",
        "destination": "Pondicherry",
        "start_date": date(2025, 7, 5),
        "end_date": date(2025, 7, 9),
        "budget": 15000,
        "travel_type": "Solo",
        "hotel": {
            "hotel_name": "Villa Shanti Heritage Hotel",
            "cost_per_night": 2800,
            "nights": 4
        },
        "places": [
            {"place_name": "Rock Beach", "category": "Beach", "rating": 4.7, "notes": "Morning walks here are therapeutic"},
            {"place_name": "Auroville", "category": "Temple", "rating": 4.8, "notes": "Matri Mandir meditation — surreal experience"},
            {"place_name": "French Quarter", "category": "Historical", "rating": 4.6, "notes": "Gorgeous colonial architecture"},
            {"place_name": "Paradise Beach", "category": "Beach", "rating": 4.5, "notes": "Secluded, took a ferry to get there"},
            {"place_name": "Manakula Vinayagar Temple", "category": "Temple", "rating": 4.4, "notes": "Elephant blessing was unique"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 1800, "description": "Bus from Chennai to Pondicherry"},
            {"category": "Transport", "amount": 600, "description": "Bicycle rental for 2 days"},
            {"category": "Transport", "amount": 400, "description": "Ferry to Paradise Beach"},
            {"category": "Food", "amount": 1500, "description": "Le Café and Surguru Restaurant"},
            {"category": "Food", "amount": 800, "description": "French bakery breakfasts"},
            {"category": "Food", "amount": 500, "description": "Street crepes and coconut water"},
            {"category": "Activities", "amount": 600, "description": "Auroville guided tour"},
            {"category": "Activities", "amount": 400, "description": "Scuba diving intro session"},
            {"category": "Shopping", "amount": 1500, "description": "Auroville handmade goods and paper"},
            {"category": "Shopping", "amount": 800, "description": "Fabric and clothing from boutiques"},
            {"category": "Stay", "amount": 11200, "description": "4 nights at Villa Shanti"},
            {"category": "Other", "amount": 300, "description": "Miscellaneous and tips"},
        ]
    },
    {
        "trip_name": "Ladakh Adventure",
        "destination": "Ladakh",
        "start_date": date(2025, 9, 10),
        "end_date": date(2025, 9, 18),
        "budget": 50000,
        "travel_type": "Solo",
        "hotel": {
            "hotel_name": "The Grand Dragon Ladakh",
            "cost_per_night": 4500,
            "nights": 8
        },
        "places": [
            {"place_name": "Pangong Lake", "category": "Park", "rating": 5.0, "notes": "Camped by the lake — life changing"},
            {"place_name": "Nubra Valley", "category": "Mountain", "rating": 4.9, "notes": "Double humped camel ride at Hunder"},
            {"place_name": "Khardung La Pass", "category": "Mountain", "rating": 4.8, "notes": "Highest motorable road in the world"},
            {"place_name": "Thiksey Monastery", "category": "Temple", "rating": 4.7, "notes": "Morning prayers at sunrise"},
            {"place_name": "Magnetic Hill", "category": "Other", "rating": 4.3, "notes": "Weird optical illusion, fun stop"},
            {"place_name": "Leh Palace", "category": "Historical", "rating": 4.6, "notes": "Panoramic views of Leh town"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 12000, "description": "Flights Delhi to Leh"},
            {"category": "Transport", "amount": 8000, "description": "Royal Enfield bike rental 8 days"},
            {"category": "Transport", "amount": 1500, "description": "Shared cab to Nubra Valley"},
            {"category": "Food", "amount": 2500, "description": "Tibetan meals — Thukpa and Momos"},
            {"category": "Food", "amount": 1200, "description": "Camping meals at Pangong"},
            {"category": "Food", "amount": 800, "description": "Bakery and cafe stops in Leh"},
            {"category": "Activities", "amount": 3500, "description": "Pangong Lake camping (2 nights)"},
            {"category": "Activities", "amount": 2000, "description": "Camel ride at Hunder Sand Dunes"},
            {"category": "Activities", "amount": 1500, "description": "River rafting on Zanskar"},
            {"category": "Activities", "amount": 800, "description": "Monastery entry and guided tour"},
            {"category": "Shopping", "amount": 3000, "description": "Pashmina shawl and thangka painting"},
            {"category": "Shopping", "amount": 1200, "description": "Tibetan jewellery and prayer flags"},
            {"category": "Stay", "amount": 36000, "description": "8 nights at The Grand Dragon Ladakh"},
            {"category": "Other", "amount": 1000, "description": "Inner line permits and tips"},
        ]
    },
]


def seed():
    with app.app_context():

        # ── Vidisha ──
        vidisha = User.query.filter_by(email="vidisha@example.com").first()
        if not vidisha:
            print("❌ Vidisha not found in DB! Run seed_data.py first.")
            return
        print(f"✅ Found user: {vidisha.name} ({vidisha.email})")

        for t in VIDISHA_TRIPS:
            trip = Trip(
                user_id=vidisha.id,
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

            print(f"  ➕ Added trip: {t['trip_name']}")

        # ── Vagvedi ──
        vagvedi = User.query.filter_by(email="vagvedi@example.com").first()
        if not vagvedi:
            print("❌ Vagvedi not found in DB! Run seed_data.py first.")
            return
        print(f"✅ Found user: {vagvedi.name} ({vagvedi.email})")

        for t in VAGVEDI_TRIPS:
            trip = Trip(
                user_id=vagvedi.id,
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

            print(f"  ➕ Added trip: {t['trip_name']}")

        db.session.commit()
        print("\n🎉 Done! All trips, hotels, places and expenses seeded successfully.")
        print("👤 Vidisha → vidisha@example.com / vidisha123")
        print("👤 Vagvedi → vagvedi@example.com / vagvedi123")


if __name__ == "__main__":
    seed()