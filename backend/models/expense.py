from extensions import db
from datetime import datetime

class Expense(db.Model):
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)
    category = db.Column(db.Enum('Transport', 'Food', 'Stay', 'Activities', 'Shopping', 'Other'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert expense object to dictionary"""
        return {
            'id': self.id,
            'trip_id': self.trip_id,
            'category': self.category,
            'amount': float(self.amount) if self.amount else None,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
