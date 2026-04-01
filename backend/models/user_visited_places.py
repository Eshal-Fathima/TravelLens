from extensions import db

class UserVisitedPlaces(db.Model):
    __tablename__ = 'user_visited_places'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    master_place_id = db.Column(db.Integer, db.ForeignKey('places_master.id'), nullable=False)