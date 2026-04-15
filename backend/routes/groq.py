import os
from google import genai
from flask import Blueprint, request, jsonify

# Create Blueprint
gemini_bp = Blueprint('gemini', __name__)

# Initialize Gemini client
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))


# ---------------- TRIP IMAGE ---------------- #
@gemini_bp.route('/gemini/trip-image', methods=['POST'])
def get_trip_image():
    try:
        data = request.get_json() or {}
        destination = data.get('destination', 'travel destination')
        travel_type = data.get('travel_type', 'leisure')

        prompt = f"""
        For a travel app trip card showing "{destination}" ({travel_type} trip),
        give me a single Unsplash source URL for a beautiful landscape/travel photo.

        Format strictly like:
        https://source.unsplash.com/800x600/?keyword1,keyword2

        Return ONLY the URL. No explanation.
        """

        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )

        image_url = (response.text or "").strip()

        # ✅ FIXED fallback
        if not image_url.startswith("http"):
            keywords = destination.lower().replace(",", "").replace(" ", ",")
            image_url = f"https://source.unsplash.com/800x600/?{keywords},travel,landscape"

        return jsonify({
            "imageUrl": image_url,
            "destination": destination
        }), 200

    except Exception as e:
        data = request.get_json(silent=True) or {}
        dest = data.get("destination", "travel")

        # ✅ FIXED HERE ALSO
        keywords = dest.lower().replace(",", "").replace(" ", ",")

        return jsonify({
            "imageUrl": f"https://source.unsplash.com/800x600/?{keywords},travel,landscape",
            "destination": dest,
            "error": str(e)
        }), 200


# ---------------- TRIP DESCRIPTION ---------------- #
@gemini_bp.route('/gemini/trip-description', methods=['POST'])
def get_trip_description():
    try:
        data = request.get_json() or {}
        destination = data.get('destination', 'a destination')
        travel_type = data.get('travel_type', 'leisure')

        prompt = f"""
        Write a single evocative sentence (max 12 words) for a {travel_type} trip to {destination}.
        Make it poetic and atmospheric.
        Return ONLY the sentence without quotes or punctuation at the end.
        """

        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )

        description = (response.text or "").strip().strip('"').strip("'")

        return jsonify({
            "description": description
        }), 200

    except Exception as e:
        data = request.get_json(silent=True) or {}

        return jsonify({
            "description": f"Explore the wonders of {data.get('destination', 'this destination')}",
            "error": str(e)
        }), 200