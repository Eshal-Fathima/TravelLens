import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { Plus, Edit2, Trash2, MapPin, Star, Save, X, Filter } from 'lucide-react'

const PlacesLogger = () => {
  const [places, setPlaces] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPlace, setEditingPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    trip_id: '',
    place_name: '',
    category: 'Beach',
    rating: '',
    notes: ''
  })

  const categories = ['Beach', 'Fort', 'Museum', 'Temple', 'Mountain', 'Park', 'Restaurant', 'Shopping', 'Entertainment', 'Historical', 'Other']

  useEffect(() => {
    fetchTrips()
  }, [])

  useEffect(() => {
    if (selectedTrip) {
      fetchPlaces(selectedTrip)
    }
  }, [selectedTrip])

  const fetchTrips = async () => {
    try {
      const response = await api.get('/api/trips')
      setTrips(response.data.trips)
      if (response.data.trips.length > 0 && !selectedTrip) {
        setSelectedTrip(response.data.trips[0].id)
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
    }
  }

  const fetchPlaces = async (tripId) => {
    try {
      setLoading(true)
      const response = await api.get(`/api/places/${tripId}`)
      setPlaces(response.data.places)
    } catch (error) {
      console.error('Error fetching places:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      trip_id: selectedTrip,
      place_name: '',
      category: 'Beach',
      rating: '',
      notes: ''
    })
    setEditingPlace(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        rating: formData.rating ? parseFloat(formData.rating) : null
      }

      if (editingPlace) {
        await api.put(`/api/places/${editingPlace.id}`, data)
      } else {
        await api.post('/api/places', data)
      }
      
      fetchPlaces(selectedTrip)
      resetForm()
    } catch (error) {
      console.error('Error saving place:', error)
      alert('Error saving place. Please try again.')
    }
  }

  const handleEdit = (place) => {
    setEditingPlace(place)
    setFormData({
      trip_id: place.trip_id,
      place_name: place.place_name,
      category: place.category,
      rating: place.rating || '',
      notes: place.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (placeId) => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      try {
        await api.delete(`/api/places/${placeId}`)
        fetchPlaces(selectedTrip)
      } catch (error) {
        console.error('Error deleting place:', error)
        alert('Error deleting place. Please try again.')
      }
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Beach': 'bg-blue-100 text-blue-800',
      'Fort': 'bg-gray-100 text-gray-800',
      'Museum': 'bg-purple-100 text-purple-800',
      'Temple': 'bg-orange-100 text-orange-800',
      'Mountain': 'bg-green-100 text-green-800',
      'Park': 'bg-emerald-100 text-emerald-800',
      'Restaurant': 'bg-red-100 text-red-800',
      'Shopping': 'bg-pink-100 text-pink-800',
      'Entertainment': 'bg-indigo-100 text-indigo-800',
      'Historical': 'bg-amber-100 text-amber-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors['Other']
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Places Logger</h1>
          <p className="text-gray-600 mt-2">Track places you visit during your trips</p>
        </div>
        <button
          onClick={() => {
            setFormData({...formData, trip_id: selectedTrip})
            setShowForm(true)
          }}
          disabled={!selectedTrip}
          className="btn-primary flex items-center space-x-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          <span>Add Place</span>
        </button>
      </div>

      {/* Trip Selector */}
      <div className="mb-6">
        <label className="label mb-2 block">Select Trip</label>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTrip}
            onChange={(e) => setSelectedTrip(e.target.value)}
            className="input flex-1 max-w-xs"
          >
            <option value="">Choose a trip...</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.trip_name} - {trip.destination}
              </option>
            ))}
          </select>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Place Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingPlace ? 'Edit Place' : 'Add New Place'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Trip</label>
                <select
                  required
                  className="input"
                  value={formData.trip_id}
                  onChange={(e) => setFormData({...formData, trip_id: e.target.value})}
                >
                  <option value="">Select a trip...</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.trip_name} - {trip.destination}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Place Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.place_name}
                  onChange={(e) => setFormData({...formData, place_name: e.target.value})}
                  placeholder="Taj Mahal"
                />
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  required
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Rating (1-5)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    className="input"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                    placeholder="4.5"
                  />
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input resize-none"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Beautiful architecture with amazing history..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingPlace ? 'Update' : 'Add'} Place</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Places List */}
      {selectedTrip ? (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : places.length > 0 ? (
            places.map((place) => (
              <div key={place.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{place.place_name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(place.category)}`}>
                        {place.category}
                      </span>
                      {place.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{place.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    {place.notes && (
                      <p className="text-gray-600 text-sm mt-2">{place.notes}</p>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(place)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(place.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No places added yet</h3>
              <p className="text-gray-600 mb-4">Start adding places you visit during this trip</p>
              <button
                onClick={() => {
                  setFormData({...formData, trip_id: selectedTrip})
                  setShowForm(true)
                }}
                className="btn-primary"
              >
                Add Your First Place
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a trip</h3>
          <p className="text-gray-600">Choose a trip to start adding places</p>
        </div>
      )}
    </div>
  )
}

export default PlacesLogger
