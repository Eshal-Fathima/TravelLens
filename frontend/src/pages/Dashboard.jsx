import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Plane, MapPin, DollarSign, Calendar, TrendingUp, Globe, Users, Star } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch user insights
      const insightsResponse = await axios.get(`/api/insights/${user.id}`)
      setInsights(insightsResponse.data.insights)

      // Fetch recent trips
      const tripsResponse = await axios.get('/api/trips')
      setTrips(tripsResponse.data.trips.slice(0, 5)) // Show only 5 recent trips
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your travel summary and latest insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold text-gray-900">{insights?.total_trips || 0}</p>
            </div>
            <Plane className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₹{insights?.total_spent?.toLocaleString() || 0}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Places Visited</p>
              <p className="text-2xl font-bold text-gray-900">{insights?.countries_visited || 0}</p>
            </div>
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Travel Personality</p>
              <p className="text-lg font-bold text-gray-900">{insights?.travel_personality || 'Explorer'}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Travel Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Travel Insights</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Most Visited Destination</span>
              <span className="font-medium text-gray-900">{insights?.most_visited_destination || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Favorite Place Type</span>
              <span className="font-medium text-gray-900">{insights?.favorite_place_category || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Trip Cost</span>
              <span className="font-medium text-gray-900">₹{insights?.average_trip_cost?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Travel Frequency</span>
              <span className="font-medium text-gray-900">{insights?.travel_frequency || 0} trips/year</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Travel Preference</span>
              <span className="font-medium text-gray-900">{insights?.travel_preference || 'Explorer'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Analysis</h2>
          {insights?.budget_analysis ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Budget Utilization</span>
                  <span className="font-medium text-gray-900">{insights.budget_analysis.budget_utilization}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(insights.budget_analysis.budget_utilization, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Budget</span>
                <span className="font-medium text-gray-900">₹{insights.budget_analysis.total_budget?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-medium text-gray-900">₹{insights.budget_analysis.total_spent?.toLocaleString() || 0}</span>
              </div>
              {insights.budget_analysis.overspend > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                  Overspend: ₹{insights.budget_analysis.overspend?.toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No budget data available</p>
          )}
        </div>
      </div>

      {/* Recent Trips */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Trips</h2>
          <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View All
          </button>
        </div>
        
        {trips.length > 0 ? (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{trip.trip_name}</h3>
                    <p className="text-sm text-gray-600">{trip.destination}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium text-gray-900">₹{trip.budget?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No trips yet. Start your first adventure!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
