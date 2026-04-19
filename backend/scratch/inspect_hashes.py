import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from extensions import db
from models.user import User

app = create_app()
with app.app_context():
    try:
        users = User.query.all()
        if not users:
            print("No users found.")
        for u in users:
            # Check if it looks like a bcrypt hash
            is_bcrypt = u.password_hash.startswith('$2')
            print(f"Email: {u.email}")
            print(f"  Hash: {u.password_hash[:10]}...")
            print(f"  Is Bcrypt: {is_bcrypt}")
            if not is_bcrypt:
                print(f"  Warning: Invalid hash format detected!")
    except Exception as e:
        print(f"Error: {e}")
