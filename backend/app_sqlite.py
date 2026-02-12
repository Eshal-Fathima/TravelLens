from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
import os
from dotenv import load_dotenv

load_dotenv()

# SQLite Configuration (for testing without MySQL)
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Use SQLite for testing (bypasses MySQL issues)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///travellens.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Import models to ensure they're registered with SQLAlchemy
    from models import User, Trip, Place, Hotel, Expense
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.trips import trips_bp
    from routes.places import places_bp
    from routes.hotels import hotels_bp
    from routes.expenses import expenses_bp
    from routes.insights import insights_bp
    from routes.recommendations import recommendations_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(trips_bp, url_prefix='/api')
    app.register_blueprint(places_bp, url_prefix='/api')
    app.register_blueprint(hotels_bp, url_prefix='/api')
    app.register_blueprint(expenses_bp, url_prefix='/api')
    app.register_blueprint(insights_bp, url_prefix='/api')
    app.register_blueprint(recommendations_bp, url_prefix='/api')
    
    # Create database tables if they don't exist
    with app.app_context():
        try:
            db.create_all()
            print("✅ SQLite database tables created successfully!")
            
            # Add sample data if database is empty
            from models.user import User
            from models.trip import Trip
            from models.expense import Expense
            from datetime import datetime, timedelta
            
            if User.query.count() == 0:
                print("📝 Adding sample data...")
                
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
                
                print("✅ Sample data added successfully!")
                print(f"👤 Sample user: john@example.com / password123")
                print("🗄️ Using SQLite database (travellens.db)")
        except Exception as e:
            print(f"❌ Database error: {e}")
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("🚀 Starting Flask app with SQLite...")
    print("📱 Frontend: http://localhost:5173")
    print("🔧 Backend: http://localhost:5000")
    app.run(debug=True, port=5000)
