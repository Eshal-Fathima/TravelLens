from extensions import db
from datetime import datetime

class Hotel(db.Model):
    __tablename__ = 'hotels'

    id             = db.Column(db.Integer, primary_key=True)
    trip_id        = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=False)
    hotel_name     = db.Column(db.String(255), nullable=False)
    cost_per_night = db.Column(db.Numeric(10, 2), nullable=False)
    nights         = db.Column(db.Integer, nullable=False)
    total_cost     = db.Column(db.Numeric(10, 2), nullable=False, default=0)  # FIX: added default=0
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, trip_id, hotel_name, cost_per_night, nights):
        self.trip_id        = trip_id
        self.hotel_name     = hotel_name
        self.cost_per_night = float(cost_per_night)   # FIX: ensure float before multiply
        self.nights         = int(nights)              # FIX: ensure int before multiply
        self.total_cost     = float(cost_per_night) * int(nights)  # FIX: explicit cast

    def to_dict(self):
        return {
            'id':             self.id,
            'trip_id':        self.trip_id,
            'hotel_name':     self.hotel_name,
            'cost_per_night': float(self.cost_per_night) if self.cost_per_night is not None else 0,
            'nights':         self.nights,
            'total_cost':     float(self.total_cost) if self.total_cost is not None else 0,
            'created_at':     self.created_at.isoformat() if self.created_at else None,
        }