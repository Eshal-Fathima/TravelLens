from app import create_app, db
from models import User, Trip, Place, Hotel, Expense

def init_database():
    """Initialize the database with all tables"""
    app = create_app()
    
    with app.app_context():
        print("Creating database tables...")
        
        # Drop all tables (for fresh start)
        db.drop_all()
        
        # Create all tables
        db.create_all()
        
        print("Database tables created successfully!")
        
        # Add sample data
        from datetime import datetime, timedelta
        
        # Sample user
        sample_user = User(
            name="John Doe",
            email="john@example.com"
        )
        sample_user.set_password("password123")
        db.session.add(sample_user)
        db.session.commit()
        
        # Sample trip
        sample_trip = Trip(
            user_id=sample_user.id,
            trip_name="Paris Adventure",
            destination="Paris, France",
            start_date=datetime.now().date(),
            end_date=(datetime.now() + timedelta(days=7)).date(),
            budget=50000,
            travel_type="Leisure"
        )
        db.session.add(sample_trip)
        db.session.commit()
        
        # Sample expense
        sample_expense = Expense(
            trip_id=sample_trip.id,
            category="Food",
            amount=2500,
            description="Dinner at Eiffel Tower Restaurant"
        )
        db.session.add(sample_expense)
        db.session.commit()
        
        print("Sample data added successfully!")
        print(f"Sample user: {sample_user.email} / password123")

if __name__ == '__main__':
    init_database()
