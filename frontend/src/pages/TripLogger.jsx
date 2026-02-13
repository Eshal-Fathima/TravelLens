import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { Plus, Edit2, Trash2, MapPin, Calendar, DollarSign, Users, Save, X } from 'lucide-react'

const TripLogger = () => {
  const [trips, setTrips] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    trip_name: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: '',
    travel_type: 'Solo'
  })

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const response = await api.get('/api/trips')
      setTrips(response.data.trips)
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      trip_name: '',
      destination: '',
      start_date: '',
      end_date: '',
      budget: '',
      travel_type: 'Solo'
    })
    setEditingTrip(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Convert budget to number and validate data
      const submissionData = {
        ...formData,
        budget: parseFloat(formData.budget)
      }
      
      // Validate budget is a valid number
      if (isNaN(submissionData.budget) || submissionData.budget <= 0) {
        alert('Please enter a valid budget amount')
        return
      }
      
      if (editingTrip) {
        await api.put(`/api/trips/${editingTrip.id}`, submissionData)
      } else {
        await api.post('/api/trips', submissionData)
      }
      
      fetchTrips()
      resetForm()
    } catch (error) {
      console.error('Error saving trip:', error)
      alert('Error saving trip. Please try again.')
    }
  }

  const handleEdit = (trip) => {
    setEditingTrip(trip)
    setFormData({
      trip_name: trip.trip_name,
      destination: trip.destination,
      start_date: trip.start_date?.split('T')[0] || '',
      end_date: trip.end_date?.split('T')[0] || '',
      budget: trip.budget?.toString() || '',
      travel_type: trip.travel_type
    })
    setShowForm(true)
  }

  const handleDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await api.delete(`/api/trips/${tripId}`)
        fetchTrips()
      } catch (error) {
        console.error('Error deleting trip:', error)
        alert('Error deleting trip. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trip Logger</h1>
          <p className="text-gray-600 mt-2">Manage your travel adventures</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2 px-4 py-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Trip</span>
        </button>
      </div>

      {/* Trip Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTrip ? 'Edit Trip' : 'Create New Trip'}
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
                <label className="label">Trip Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.trip_name}
                  onChange={(e) => setFormData({...formData, trip_name: e.target.value})}
                  placeholder="Summer Vacation 2024"
                />
              </div>

              <div>
                <label className="label">Destination</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  placeholder="Goa, India"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    min={formData.start_date}
                  />
                </div>
              </div>

              <div>
                <label className="label">Budget (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="input"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  placeholder="25000"
                />
              </div>

              <div>
                <label className="label">Travel Type</label>
                <select
                  className="input"
                  value={formData.travel_type}
                  onChange={(e) => setFormData({...formData, travel_type: e.target.value})}
                >
                  <option value="Solo">Solo</option>
                  <option value="Family">Family</option>
                  <option value="Friends">Friends</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingTrip ? 'Update' : 'Create'} Trip</span>
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

      {/* Trips List */}
      <div className="space-y-4">
        {trips.length > 0 ? (
          trips.map((trip) => (
            <div key={trip.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{trip.trip_name}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {trip.travel_type}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>Budget: ₹{trip.budget?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(trip)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-600 mb-4">Start your travel journey by creating your first trip</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Create Your First Trip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TripLogger
