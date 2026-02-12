import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { Plus, Edit2, Trash2, Hotel, DollarSign, Moon, Save, X, Filter } from 'lucide-react'

const HotelLogger = () => {
  const [hotels, setHotels] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingHotel, setEditingHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    trip_id: '',
    hotel_name: '',
    cost_per_night: '',
    nights: ''
  })

  useEffect(() => {
    fetchTrips()
  }, [])

  useEffect(() => {
    if (selectedTrip) {
      fetchHotels(selectedTrip)
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

  const fetchHotels = async (tripId) => {
    try {
      setLoading(true)
      const response = await api.get(`/api/hotels/${tripId}`)
      setHotels(response.data.hotels)
    } catch (error) {
      console.error('Error fetching hotels:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      trip_id: selectedTrip,
      hotel_name: '',
      cost_per_night: '',
      nights: ''
    })
    setEditingHotel(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        cost_per_night: parseFloat(formData.cost_per_night),
        nights: parseInt(formData.nights)
      }

      if (editingHotel) {
        await api.put(`/api/hotels/${editingHotel.id}`, data)
      } else {
        await api.post('/api/hotels', data)
      }
      
      fetchHotels(selectedTrip)
      resetForm()
    } catch (error) {
      console.error('Error saving hotel:', error)
      alert('Error saving hotel. Please try again.')
    }
  }

  const handleEdit = (hotel) => {
    setEditingHotel(hotel)
    setFormData({
      trip_id: hotel.trip_id,
      hotel_name: hotel.hotel_name,
      cost_per_night: hotel.cost_per_night.toString(),
      nights: hotel.nights.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (hotelId) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        await api.delete(`/api/hotels/${hotelId}`)
        fetchHotels(selectedTrip)
      } catch (error) {
        console.error('Error deleting hotel:', error)
        alert('Error deleting hotel. Please try again.')
      }
    }
  }

  const calculateTotalCost = () => {
    const costPerNight = parseFloat(formData.cost_per_night) || 0
    const nights = parseInt(formData.nights) || 0
    return costPerNight * nights
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotel Logger</h1>
          <p className="text-gray-600 mt-2">Track your accommodation details</p>
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
          <span>Add Hotel</span>
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

      {/* Hotel Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
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
                <label className="label">Hotel Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.hotel_name}
                  onChange={(e) => setFormData({...formData, hotel_name: e.target.value})}
                  placeholder="Taj Resort & Convention Centre"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Cost per Night (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="input"
                    value={formData.cost_per_night}
                    onChange={(e) => setFormData({...formData, cost_per_night: e.target.value})}
                    placeholder="8000"
                  />
                </div>
                <div>
                  <label className="label">Nights</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="input"
                    value={formData.nights}
                    onChange={(e) => setFormData({...formData, nights: e.target.value})}
                    placeholder="4"
                  />
                </div>
              </div>

              {calculateTotalCost() > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Total Cost</span>
                    <span className="text-lg font-bold text-blue-900">₹{calculateTotalCost().toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingHotel ? 'Update' : 'Add'} Hotel</span>
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

      {/* Hotels List */}
      {selectedTrip ? (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : hotels.length > 0 ? (
            hotels.map((hotel) => (
              <div key={hotel.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Hotel className="h-5 w-5 text-primary-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{hotel.hotel_name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>₹{hotel.cost_per_night?.toLocaleString()} / night</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Moon className="h-4 w-4" />
                        <span>{hotel.nights} nights</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold text-gray-900">₹{hotel.total_cost?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(hotel)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(hotel.id)}
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
              <Hotel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels added yet</h3>
              <p className="text-gray-600 mb-4">Start adding your accommodation details</p>
              <button
                onClick={() => {
                  setFormData({...formData, trip_id: selectedTrip})
                  setShowForm(true)
                }}
                className="btn-primary"
              >
                Add Your First Hotel
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Hotel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a trip</h3>
          <p className="text-gray-600">Choose a trip to start adding hotels</p>
        </div>
      )}
    </div>
  )
}

export default HotelLogger
