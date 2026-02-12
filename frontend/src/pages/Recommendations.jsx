import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { Lightbulb, MapPin, DollarSign, Compass, Target, TrendingUp, Globe, Star, Heart } from 'lucide-react'

const Recommendations = () => {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await api.get(`/api/recommendations/${user.id}`)
      setRecommendations(response.data.recommendations)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
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
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Personalized Recommendations</h1>
        <p className="text-xl text-gray-600">Discover new destinations and optimize your travel experience</p>
      </div>

      {!recommendations ? (
        <div className="text-center py-16">
          <Compass className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Recommendations Yet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start logging your trips to get personalized travel recommendations and insights
          </p>
          <button className="btn-primary px-6 py-3">
            Start Your Journey
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Destination Recommendations */}
          <section>
            <div className="flex items-center mb-6">
              <Globe className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Recommended Destinations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.destinations?.map((dest, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{dest.name}</h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
                        {dest.category}
                      </span>
                    </div>
                    <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
                  </div>
                  <p className="text-gray-600 text-sm">{dest.description}</p>
                  <button className="mt-4 w-full btn-outline text-sm">
                    Explore Destination
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Place Recommendations */}
          <section>
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Places to Visit</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.places?.map((place, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{place.location}</p>
                      <p className="text-gray-700 text-sm">{place.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Budget Optimization Tips */}
          <section>
            <div className="flex items-center mb-6">
              <DollarSign className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Budget Optimization Tips</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.budget_tips?.map((tip, index) => (
                <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-green-800 bg-green-100 px-2 py-1 rounded">
                          {tip.category}
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          Save {tip.savings}
                        </span>
                      </div>
                      <p className="text-gray-700">{tip.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Travel Tips */}
          <section>
            <div className="flex items-center mb-6">
              <Lightbulb className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Travel Tips for You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.travel_tips?.map((tip, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
                  <div className="text-4xl mb-4">{tip.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-gray-600 text-sm">{tip.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Next Trip Suggestions */}
          <section>
            <div className="flex items-center mb-6">
              <Target className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Your Next Adventure</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.next_trip_suggestions?.map((suggestion, index) => (
                <div key={index} className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-xl text-white">
                  <h3 className="text-xl font-bold mb-2">{suggestion.type}</h3>
                  <p className="text-primary-100 mb-4">{suggestion.suggestion}</p>
                  <p className="text-sm text-primary-200 italic">{suggestion.reason}</p>
                  <button className="mt-4 bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors">
                    Plan This Trip
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Recommendations
