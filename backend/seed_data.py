"""
Seed script for TravelLens - Real Indian travel data for 2026
Run from the backend directory: python seed_data.py
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

TRIPS = [
    {
        "trip_name": "Jaipur Heritage Trail",
        "destination": "Jaipur, Rajasthan",
        "start_date": date(2026, 1, 10),
        "end_date": date(2026, 1, 14),
        "budget": 22000.00,
        "travel_type": "Friends",
        "hotel": {
            "hotel_name": "Samode Haveli",
            "cost_per_night": 3500.00,
            "nights": 4
        },
        "places": [
            {"place_name": "Amber Fort", "category": "Fort", "rating": 4.8, "notes": "Stunning Mughal-Rajput architecture, elephant ride up the hill"},
            {"place_name": "City Palace Jaipur", "category": "Historical", "rating": 4.6, "notes": "Royal residence with incredible courtyards and museums"},
            {"place_name": "Hawa Mahal", "category": "Historical", "rating": 4.5, "notes": "Palace of Winds, iconic pink facade with 953 windows"},
            {"place_name": "Jantar Mantar Jaipur", "category": "Museum", "rating": 4.3, "notes": "UNESCO World Heritage astronomical observatory"},
            {"place_name": "Nahargarh Fort", "category": "Fort", "rating": 4.4, "notes": "Hilltop fort with panoramic views of Jaipur city"},
            {"place_name": "Johari Bazaar", "category": "Shopping", "rating": 4.2, "notes": "Famous for jewellery, bangles and traditional Rajasthani items"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 4500.00, "description": "Train tickets Chennai to Jaipur (round trip)"},
            {"category": "Food", "amount": 3800.00, "description": "Dal baati churma, Laal Maas, local thalis"},
            {"category": "Activities", "amount": 2200.00, "description": "Fort entry tickets, elephant ride, Jantar Mantar"},
            {"category": "Shopping", "amount": 3500.00, "description": "Rajasthani handicrafts, blue pottery, jewellery"},
            {"category": "Transport", "amount": 1200.00, "description": "Auto rickshaws and local cab within Jaipur"},
        ]
    },
    {
        "trip_name": "Varanasi Spiritual Journey",
        "destination": "Varanasi, Uttar Pradesh",
        "start_date": date(2026, 2, 5),
        "end_date": date(2026, 2, 8),
        "budget": 15000.00,
        "travel_type": "Solo",
        "hotel": {
            "hotel_name": "Brijrama Palace",
            "cost_per_night": 2800.00,
            "nights": 3
        },
        "places": [
            {"place_name": "Dashashwamedh Ghat", "category": "Temple", "rating": 4.9, "notes": "Main ghat on Ganges, spectacular Ganga Aarti every evening"},
            {"place_name": "Kashi Vishwanath Temple", "category": "Temple", "rating": 4.8, "notes": "One of the twelve Jyotirlingas, very sacred Shiva temple"},
            {"place_name": "Manikarnika Ghat", "category": "Historical", "rating": 4.5, "notes": "Ancient cremation ghat, profound and deeply moving experience"},
            {"place_name": "Sarnath", "category": "Historical", "rating": 4.6, "notes": "Where Buddha gave his first sermon, beautiful Dhamek Stupa"},
            {"place_name": "Ramnagar Fort", "category": "Fort", "rating": 4.1, "notes": "17th century fort on eastern bank of Ganges"},
            {"place_name": "Vishwanath Gali", "category": "Shopping", "rating": 4.0, "notes": "Famous lane for Banarasi silk sarees and street food"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 3200.00, "description": "Flight Chennai to Varanasi"},
            {"category": "Food", "amount": 2500.00, "description": "Banarasi chaat, kachori sabzi, lassi at Blue Lassi shop"},
            {"category": "Activities", "amount": 1500.00, "description": "Boat ride on Ganges at sunrise, Sarnath entry"},
            {"category": "Shopping", "amount": 2000.00, "description": "Banarasi silk dupatta and religious items"},
            {"category": "Transport", "amount": 800.00, "description": "E-rickshaw and boat rides within Varanasi"},
        ]
    },
    {
        "trip_name": "Coorg Coffee Country",
        "destination": "Coorg, Karnataka",
        "start_date": date(2026, 3, 14),
        "end_date": date(2026, 3, 18),
        "budget": 28000.00,
        "travel_type": "Family",
        "hotel": {
            "hotel_name": "The Tamara Coorg",
            "cost_per_night": 5500.00,
            "nights": 4
        },
        "places": [
            {"place_name": "Abbey Falls", "category": "Park", "rating": 4.5, "notes": "Beautiful 70ft waterfall surrounded by coffee and spice plantations"},
            {"place_name": "Raja's Seat", "category": "Park", "rating": 4.3, "notes": "Garden with stunning sunset views, former seat of Kodagu kings"},
            {"place_name": "Namdroling Monastery", "category": "Temple", "rating": 4.7, "notes": "Golden Temple, largest Nyingma teaching centre outside Tibet"},
            {"place_name": "Iruppu Falls", "category": "Park", "rating": 4.4, "notes": "Sacred waterfall near Brahmagiri Wildlife Sanctuary"},
            {"place_name": "Madikeri Fort", "category": "Fort", "rating": 4.1, "notes": "18th century fort built by Tipu Sultan, now houses a museum"},
            {"place_name": "Dubare Elephant Camp", "category": "Entertainment", "rating": 4.6, "notes": "Elephant bathing and interaction on the banks of River Cauvery"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 3500.00, "description": "Drive from Chennai to Coorg, fuel and toll"},
            {"category": "Food", "amount": 5500.00, "description": "Pandi curry, kadambuttu, Coorg pork dishes, family meals"},
            {"category": "Activities", "amount": 3800.00, "description": "Elephant camp, coffee plantation tour, waterfall entry fees"},
            {"category": "Shopping", "amount": 4000.00, "description": "Coorg coffee, cardamom, pepper, local honey"},
            {"category": "Transport", "amount": 1500.00, "description": "Local cabs within Coorg for sightseeing"},
        ]
    },
    {
        "trip_name": "Rishikesh Adventure & Yoga",
        "destination": "Rishikesh, Uttarakhand",
        "start_date": date(2026, 4, 3),
        "end_date": date(2026, 4, 7),
        "budget": 20000.00,
        "travel_type": "Friends",
        "hotel": {
            "hotel_name": "Zostel Rishikesh",
            "cost_per_night": 1200.00,
            "nights": 4
        },
        "places": [
            {"place_name": "Laxman Jhula", "category": "Historical", "rating": 4.5, "notes": "Iconic 450ft iron suspension bridge over River Ganges"},
            {"place_name": "Triveni Ghat", "category": "Temple", "rating": 4.6, "notes": "Sacred bathing ghat, evening aarti is spectacular"},
            {"place_name": "Neelkanth Mahadev Temple", "category": "Temple", "rating": 4.7, "notes": "Important Shiva temple at 1330m altitude in the hills"},
            {"place_name": "Beatles Ashram (Chaurasi Kutia)", "category": "Historical", "rating": 4.3, "notes": "Abandoned ashram where The Beatles stayed in 1968"},
            {"place_name": "Rajaji National Park", "category": "Park", "rating": 4.4, "notes": "Jeep safari, spotted elephants and deer"},
            {"place_name": "Shivpuri Rafting Point", "category": "Entertainment", "rating": 4.8, "notes": "Best white water rafting stretch on the Ganges, Grade 3-4 rapids"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 5500.00, "description": "Flight Chennai to Dehradun, taxi to Rishikesh"},
            {"category": "Food", "amount": 3000.00, "description": "Cafes on the Ganges, Chotiwala restaurant, street food"},
            {"category": "Activities", "amount": 4500.00, "description": "White water rafting, bungee jumping, Rajaji safari"},
            {"category": "Shopping", "amount": 2000.00, "description": "Yoga mats, rudraksha beads, spiritual books"},
            {"category": "Transport", "amount": 1000.00, "description": "Shared autos and cabs within Rishikesh"},
        ]
    },
    {
        "trip_name": "Andaman Island Escape",
        "destination": "Port Blair, Andaman & Nicobar Islands",
        "start_date": date(2026, 5, 20),
        "end_date": date(2026, 5, 26),
        "budget": 55000.00,
        "travel_type": "Friends",
        "hotel": {
            "hotel_name": "Munjoh Ocean Resort",
            "cost_per_night": 7500.00,
            "nights": 6
        },
        "places": [
            {"place_name": "Radhanagar Beach", "category": "Beach", "rating": 4.9, "notes": "Voted one of Asia's best beaches, pristine white sand and turquoise water"},
            {"place_name": "Cellular Jail", "category": "Historical", "rating": 4.7, "notes": "Colonial prison used by British, powerful light and sound show"},
            {"place_name": "Elephant Beach", "category": "Beach", "rating": 4.7, "notes": "Excellent snorkelling with vibrant coral reefs"},
            {"place_name": "Ross Island", "category": "Historical", "rating": 4.4, "notes": "Ruins of former British administrative headquarters, deer roam freely"},
            {"place_name": "Neil Island (Shaheed Dweep)", "category": "Beach", "rating": 4.6, "notes": "Quiet beach island, natural rock formation called Natural Bridge"},
            {"place_name": "North Bay Island", "category": "Beach", "rating": 4.5, "notes": "Sea walking, glass bottom boat ride, excellent coral viewing"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 14000.00, "description": "Return flights Chennai to Port Blair"},
            {"category": "Food", "amount": 8000.00, "description": "Fresh seafood, beach shacks, hotel dining"},
            {"category": "Activities", "amount": 9000.00, "description": "Snorkelling, sea walking, glass bottom boat, ferry to Neil Island"},
            {"category": "Shopping", "amount": 4000.00, "description": "Shell jewellery, Andaman pearls, coconut handicrafts"},
            {"category": "Transport", "amount": 5000.00, "description": "Inter-island ferries, local cabs, boat rides"},
        ]
    },
    {
        "trip_name": "Spiti Valley High Altitude Trek",
        "destination": "Spiti Valley, Himachal Pradesh",
        "start_date": date(2026, 7, 8),
        "end_date": date(2026, 7, 16),
        "budget": 45000.00,
        "travel_type": "Friends",
        "hotel": {
            "hotel_name": "Spiti Valley Retreat Kaza",
            "cost_per_night": 1800.00,
            "nights": 8
        },
        "places": [
            {"place_name": "Key Monastery", "category": "Temple", "rating": 4.8, "notes": "Thousand-year-old Tibetan Buddhist monastery at 4166m altitude"},
            {"place_name": "Chandratal Lake", "category": "Mountain", "rating": 4.9, "notes": "Crescent-shaped lake at 4300m, surreal blue waters surrounded by mountains"},
            {"place_name": "Kibber Village", "category": "Other", "rating": 4.5, "notes": "One of the highest motorable villages in the world at 4270m"},
            {"place_name": "Dhankar Fort", "category": "Fort", "rating": 4.6, "notes": "Precariously perched 1000-year-old fort above Dhankar village"},
            {"place_name": "Pin Valley National Park", "category": "Park", "rating": 4.7, "notes": "Spotted snow leopard tracks, saw Himalayan ibex"},
            {"place_name": "Kunzum Pass", "category": "Mountain", "rating": 4.8, "notes": "High mountain pass at 4590m, connecting Spiti and Lahaul valleys"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 8000.00, "description": "Flight Chennai to Chandigarh, shared SUV to Kaza"},
            {"category": "Food", "amount": 6000.00, "description": "Thukpa, momos, tsampa, local homestay meals"},
            {"category": "Activities", "amount": 5000.00, "description": "Monastery entries, jeep safari in Pin Valley, Chandratal camping"},
            {"category": "Shopping", "amount": 4000.00, "description": "Tibetan handicrafts, pashmina stoles, prayer flags"},
            {"category": "Transport", "amount": 7000.00, "description": "Shared jeep within Spiti Valley, Kunzum Pass excursion"},
            {"category": "Other", "amount": 3000.00, "description": "Altitude sickness medication, warm gear rental"},
        ]
    },
    {
        "trip_name": "Mysuru Dasara Special",
        "destination": "Mysuru, Karnataka",
        "start_date": date(2026, 10, 1),
        "end_date": date(2026, 10, 4),
        "budget": 18000.00,
        "travel_type": "Family",
        "hotel": {
            "hotel_name": "Radisson Blu Plaza Hotel Mysore",
            "cost_per_night": 4200.00,
            "nights": 3
        },
        "places": [
            {"place_name": "Mysore Palace", "category": "Historical", "rating": 4.9, "notes": "Indo-Saracenic marvel, illuminated with 100,000 bulbs during Dasara"},
            {"place_name": "Chamundeshwari Temple", "category": "Temple", "rating": 4.7, "notes": "Temple atop Chamundi Hills, 1000-step climb, excellent city views"},
            {"place_name": "Brindavan Gardens", "category": "Park", "rating": 4.4, "notes": "Terraced gardens below KRS dam, musical fountain in the evening"},
            {"place_name": "Jaganmohan Palace Art Gallery", "category": "Museum", "rating": 4.2, "notes": "Former royal palace turned art gallery with Raja Ravi Varma paintings"},
            {"place_name": "Devaraja Market", "category": "Shopping", "rating": 4.3, "notes": "170-year-old market, famous for flowers, sandalwood and silk"},
            {"place_name": "St. Philomena's Cathedral", "category": "Historical", "rating": 4.4, "notes": "Neo-Gothic church, one of the largest churches in India"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 2500.00, "description": "Train Chennai to Mysuru (round trip), family of 3"},
            {"category": "Food", "amount": 4000.00, "description": "Mysore pak, dosas at hotel Dasaprakash, family dinners"},
            {"category": "Activities", "amount": 2500.00, "description": "Palace entry, Brindavan Gardens, Chamundi Hills cable car"},
            {"category": "Shopping", "amount": 5000.00, "description": "Mysore silk sarees, sandalwood products, agarbatti"},
            {"category": "Transport", "amount": 1500.00, "description": "Auto rickshaws and cab to Brindavan Gardens"},
        ]
    },
    {
        "trip_name": "Rann of Kutch White Desert",
        "destination": "Kutch, Gujarat",
        "start_date": date(2026, 11, 14),
        "end_date": date(2026, 11, 18),
        "budget": 32000.00,
        "travel_type": "Friends",
        "hotel": {
            "hotel_name": "Rann Utsav Tent City",
            "cost_per_night": 5800.00,
            "nights": 4
        },
        "places": [
            {"place_name": "White Rann of Kutch", "category": "Other", "rating": 4.9, "notes": "Vast salt desert, mesmerizing under full moon at Rann Utsav festival"},
            {"place_name": "Kala Dungar (Black Hill)", "category": "Mountain", "rating": 4.6, "notes": "Highest point in Kutch at 462m, panoramic view of the entire Rann"},
            {"place_name": "Dholavira", "category": "Historical", "rating": 4.7, "notes": "UNESCO World Heritage Site, 5000-year-old Indus Valley Civilisation city"},
            {"place_name": "Bhuj Palace (Aina Mahal)", "category": "Historical", "rating": 4.3, "notes": "18th century palace with Hall of Mirrors, Kutchi art collection"},
            {"place_name": "Nirona Village", "category": "Other", "rating": 4.5, "notes": "Famous for Rogan art and copper bell making, met artisan families"},
            {"place_name": "Mandvi Beach", "category": "Beach", "rating": 4.4, "notes": "Clean beach with wind farm backdrop, fresh seafood at shacks"},
        ],
        "expenses": [
            {"category": "Transport", "amount": 7000.00, "description": "Flight Chennai to Bhuj (round trip)"},
            {"category": "Food", "amount": 5000.00, "description": "Kutchi cuisine, dal dhokli, bajra rotla, tent city buffet"},
            {"category": "Activities", "amount": 4500.00, "description": "Rann Utsav entry, cultural programs, camel ride, Dholavira entry"},
            {"category": "Shopping", "amount": 6000.00, "description": "Kutchi embroidery, Rogan art paintings, mirror work textiles"},
            {"category": "Transport", "amount": 3500.00, "description": "Hired cab for Dholavira day trip and Kala Dungar"},
        ]
    },
]


def seed():
    with app.app_context():
        # Find user
        user = User.query.filter_by(email=SEED_EMAIL).first()
        if not user:
            print(f"❌ User with email '{SEED_EMAIL}' not found.")
            print("Please register first via the app, then run this script.")
            return

        print(f"✅ Found user: {user.name} ({user.email})")

        # Check if data already exists
        existing = Trip.query.filter_by(user_id=user.id).count()
        if existing > 0:
            print(f"⚠️  User already has {existing} trips. Skipping seed to avoid duplicates.")
            print("If you want to re-seed, delete existing trips first.")
            return

        print("🌱 Seeding travel data...\n")

        for t in TRIPS:
            # Create trip
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
            db.session.flush()  # get trip.id before commit

            # Create hotel
            h = t["hotel"]
            hotel = Hotel(
                trip_id=trip.id,
                hotel_name=h["hotel_name"],
                cost_per_night=h["cost_per_night"],
                nights=h["nights"]
            )
            db.session.add(hotel)

            # Create places
            for p in t["places"]:
                place = Place(
                    trip_id=trip.id,
                    place_name=p["place_name"],
                    category=p["category"],
                    rating=p["rating"],
                    notes=p["notes"]
                )
                db.session.add(place)

            # Create expenses
            for e in t["expenses"]:
                expense = Expense(
                    trip_id=trip.id,
                    category=e["category"],
                    amount=e["amount"],
                    description=e["description"]
                )
                db.session.add(expense)

            print(f"  ✈️  {t['trip_name']} → {t['destination']}")

        db.session.commit()
        print(f"\n✅ Seeded {len(TRIPS)} trips with places, hotels and expenses successfully!")
        print("🚀 Open TravelLens and check your Analytics dashboard!")


if __name__ == '__main__':
    seed()