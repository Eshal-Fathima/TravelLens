import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { BarChart3, TrendingUp, Globe, Star, MapPin, Calendar, DollarSign, Users, Award, Target } from 'lucide-react'

const Insights = () => {
  const { user } = useAuth()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await api.get(`/api/insights/${user.id}`)
      setInsights(response.data.insights)
    } catch (error) {
      console.error('Error fetching insights:', error)
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

  const getPersonalityColor = (personality) => {
    const colors = {
      'Budget Explorer': 'text-green-600 bg-green-100',
      'Smart Traveler': 'text-blue-600 bg-blue-100',
      'Comfort Seeker': 'text-purple-600 bg-purple-100',
      'Luxury Traveler': 'text-yellow-600 bg-yellow-100',
      'New Traveler': 'text-gray-600 bg-gray-100'
    }
    return colors[personality] || colors['New Traveler']
  }

  const getPreferenceIcon = (preference) => {
    if (preference?.includes('Beach')) return '🌊'
    if (preference?.includes('Mountain')) return '🏔️'
    if (preference?.includes('Cultural')) return '🏛️'
    if (preference?.includes('City')) return '🏙️'
    return '🗺️'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Travel Wrapped</h1>
        <p className="text-xl text-gray-600">Discover your travel personality and journey highlights</p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full">
          <Calendar className="h-5 w-5 mr-2" />
          <span className="font-medium">{new Date().getFullYear()} Travel Summary</span>
        </div>
      </div>

      {!insights || insights.total_trips === 0 ? (
        <div className="text-center py-16">
          <MapPin className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Travel Data Yet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start logging your trips to see your personalized travel insights and analytics
          </p>
          <button className="btn-primary px-6 py-3">
            Start Your First Trip
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <Globe className="h-8 w-8 opacity-80" />
                <span className="text-3xl font-bold">{insights.total_trips}</span>
              </div>
              <h3 className="text-lg font-medium">Total Trips</h3>
              <p className="text-blue-100 text-sm mt-1">Adventures taken</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8 opacity-80" />
                <span className="text-3xl font-bold">₹{(insights.total_spent / 1000).toFixed(0)}K</span>
              </div>
              <h3 className="text-lg font-medium">Total Spent</h3>
              <p className="text-green-100 text-sm mt-1">Invested in memories</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <MapPin className="h-8 w-8 opacity-80" />
                <span className="text-3xl font-bold">{insights.countries_visited}</span>
              </div>
              <h3 className="text-lg font-medium">Places Explored</h3>
              <p className="text-purple-100 text-sm mt-1">Destinations discovered</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 opacity-80" />
                <span className="text-3xl font-bold">{insights.travel_frequency}</span>
              </div>
              <h3 className="text-lg font-medium">Trips per Year</h3>
              <p className="text-orange-100 text-sm mt-1">Travel frequency</p>
            </div>
          </div>

          {/* Travel Personality Card */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="text-center">
              <Award className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Travel Personality</h2>
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${getPersonalityColor(insights.travel_personality)}`}>
                <Star className="h-6 w-6 mr-2" />
                {insights.travel_personality}
              </div>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                {insights.travel_personality === 'Budget Explorer' && 'You love exploring the world while being smart with your money. Budget travel doesn\'t mean compromising on experiences!'}
                {insights.travel_personality === 'Smart Traveler' && 'You strike the perfect balance between comfort and cost. You know how to get the best value for your money while enjoying quality experiences.'}
                {insights.travel_personality === 'Comfort Seeker' && 'You believe in traveling comfortably and are willing to invest in premium experiences. Comfort and convenience are your priorities.'}
                {insights.travel_personality === 'Luxury Traveler' && 'You spare no expense when it comes to travel. Luxury, exclusivity, and premium experiences are what you seek.'}
                {insights.travel_personality === 'New Traveler' && 'You\'re just beginning your travel journey. Every trip is a new adventure and you\'re discovering your travel style.'}
              </p>
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Travel Preference</h2>
              </div>
              <div className="text-center py-6">
                <div className="text-6xl mb-4">{getPreferenceIcon(insights.travel_preference)}</div>
                <p className="text-2xl font-bold text-gray-900">{insights.travel_preference}</p>
                <p className="text-gray-600 mt-2">Your travel vibe</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Travel Stats</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Most Visited</span>
                  <span className="font-bold text-gray-900">{insights.most_visited_destination || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Favorite Place Type</span>
                  <span className="font-bold text-gray-900">{insights.favorite_place_category || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Average Trip Cost</span>
                  <span className="font-bold text-gray-900">₹{insights.average_trip_cost?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Analysis */}
          {insights.budget_analysis && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center mb-6">
                <DollarSign className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Budget Analysis</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">₹{insights.budget_analysis.total_budget?.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Actual Spending</p>
                  <p className="text-2xl font-bold text-gray-900">₹{insights.budget_analysis.total_spent?.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Budget Utilization</p>
                  <p className="text-2xl font-bold text-gray-900">{insights.budget_analysis.budget_utilization}%</p>
                </div>
              </div>
              
              {insights.budget_analysis.overspend > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">
                    ⚠️ You overspent by ₹{insights.budget_analysis.overspend?.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Destination Breakdown */}
          {insights.destination_breakdown && Object.keys(insights.destination_breakdown).length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center mb-6">
                <Globe className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Destination Breakdown</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(insights.destination_breakdown).map(([destination, count]) => (
                  <div key={destination} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{destination}</span>
                    <span className="font-bold text-primary-600">{count} trips</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Insights
