from extensions import db
from datetime import datetime

class Hotel(db.Model):
    __tablename__ = 'hotels'
    
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)
    hotel_name = db.Column(db.String(255), nullable=False)
    cost_per_night = db.Column(db.Numeric(10, 2), nullable=False)
    nights = db.Column(db.Integer, nullable=False)
    total_cost = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, trip_id, hotel_name, cost_per_night, nights):
        self.trip_id = trip_id
        self.hotel_name = hotel_name
        self.cost_per_night = cost_per_night
        self.nights = nights
        self.total_cost = cost_per_night * nights
    
    def to_dict(self):
        """Convert hotel object to dictionary"""
        return {
            'id': self.id,
            'trip_id': self.trip_id,
            'hotel_name': self.hotel_name,
            'cost_per_night': float(self.cost_per_night) if self.cost_per_night else None,
            'nights': self.nights,
            'total_cost': float(self.total_cost) if self.total_cost else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
