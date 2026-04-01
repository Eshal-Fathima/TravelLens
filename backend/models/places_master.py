from extensions import db

class PlaceMaster(db.Model):
    __tablename__ = 'places_master'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(255))
    category = db.Column(db.String(100))
    description = db.Column(db.Text)