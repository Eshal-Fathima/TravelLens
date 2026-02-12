from extensions import db
from datetime import datetime

class Place(db.Model):
    __tablename__ = 'places'
    
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)
    place_name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.Enum('Beach', 'Fort', 'Museum', 'Temple', 'Mountain', 'Park', 'Restaurant', 'Shopping', 'Entertainment', 'Historical', 'Other'), nullable=False)
    rating = db.Column(db.Numeric(2, 1))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert place object to dictionary"""
        return {
            'id': self.id,
            'trip_id': self.trip_id,
            'place_name': self.place_name,
            'category': self.category,
            'rating': float(self.rating) if self.rating else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
