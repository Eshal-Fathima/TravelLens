from extensions import db
from datetime import datetime

class Trip(db.Model):
    __tablename__ = 'trips'

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    trip_name   = db.Column(db.String(255), nullable=False)
    destination = db.Column(db.String(255), nullable=False)
    start_date  = db.Column(db.Date, nullable=False)
    end_date    = db.Column(db.Date, nullable=False)
    budget      = db.Column(db.Numeric(10, 2), nullable=False)

    # FIX: was Enum('Solo','Family','Friends') — too restrictive and case-sensitive.
    # Changed to String so any travel_type value works without crashing the ORM load.
    travel_type = db.Column(db.String(50), nullable=False, default='Solo')

    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    places   = db.relationship('Place',   backref='trip', lazy=True, cascade='all, delete-orphan')
    hotels   = db.relationship('Hotel',   backref='trip', lazy=True, cascade='all, delete-orphan')
    expenses = db.relationship('Expense', backref='trip', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id':          self.id,
            'user_id':     self.user_id,
            'trip_name':   self.trip_name,
            'destination': self.destination,
            'start_date':  self.start_date.isoformat() if self.start_date else None,
            'end_date':    self.end_date.isoformat() if self.end_date else None,
            'budget':      float(self.budget) if self.budget is not None else 0,
            'travel_type': self.travel_type,
            'created_at':  self.created_at.isoformat() if self.created_at else None,
        }