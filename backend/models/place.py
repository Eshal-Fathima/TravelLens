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
    
    # 🔥 THIS IS IMPORTANT (link to master table)
    master_place_id = db.Column(db.Integer, db.ForeignKey('places_master.id'), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    

    def link_to_master(self):
        """
        🔥 Link this place to places_master
        """
        from models.places_master import PlaceMaster
        
        master_place = PlaceMaster.query.filter_by(name=self.place_name).first()
        
        if master_place:
            self.master_place_id = master_place.id
            return master_place.id
        
        return None


    def add_to_visited(self, user_id):
        """
        🔥 Add entry to user_visited_places
        """
        from models.user_visited_places import UserVisitedPlaces
        
        if self.master_place_id:
            visited = UserVisitedPlaces(
                user_id=user_id,
                master_place_id=self.master_place_id
            )
            db.session.add(visited)


    def to_dict(self):
        """Convert place object to dictionary"""
        return {
            'id': self.id,
            'trip_id': self.trip_id,
            'place_name': self.place_name,
            'category': self.category,
            'rating': float(self.rating) if self.rating else None,
            'notes': self.notes,
            'master_place_id': self.master_place_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }