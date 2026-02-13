import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { 
  Plane, MapPin, DollarSign, Calendar, TrendingUp, Globe, Users, Star, 
  Compass, CreditCard, Target, Award, Heart, BarChart3, PieChart, Activity
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState([])
  const [animatedStats, setAnimatedStats] = useState({
    totalTrips: 0,
    totalSpent: 0,
    placesVisited: 0,
    avgTripCost: 0
  })

  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardData()
    }
  }, [user, authLoading])

  useEffect(() => {
    if (insights) {
      // Animate counters with real data
      const duration = 2000
      const steps = 60
      const increment = {
        totalTrips: (insights.total_trips || 0) / steps,
        totalSpent: (insights.total_spent || 0) / steps,
        placesVisited: (insights.countries_visited || 0) / steps,
        avgTripCost: (insights.average_trip_cost || 0) / steps
      }
      
      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        if (currentStep <= steps) {
          setAnimatedStats({
            totalTrips: Math.floor(increment.totalTrips * currentStep),
            totalSpent: Math.floor(increment.totalSpent * currentStep),
            placesVisited: Math.floor(increment.placesVisited * currentStep),
            avgTripCost: Math.floor(increment.avgTripCost * currentStep)
          })
        } else {
          clearInterval(timer)
          setAnimatedStats({
            totalTrips: insights.total_trips || 0,
            totalSpent: insights.total_spent || 0,
            placesVisited: insights.countries_visited || 0,
            avgTripCost: insights.average_trip_cost || 0
          })
        }
      }, duration / steps)
      
      return () => clearInterval(timer)
    }
  }, [insights])

  const fetchDashboardData = async () => {
    try {
      // Fetch user insights
      const insightsResponse = await api.get(`/api/insights/${user.id}`)
      setInsights(insightsResponse.data.insights)

      // Fetch recent trips
      const tripsResponse = await api.get('/api/trips')
      setTrips(tripsResponse.data.trips.slice(0, 5))

      // Fetch chart data
      await fetchExpenseData()
      await fetchTripsPerMonth()
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTravelPersonalityColor = (personality) => {
    const colors = {
      'New Traveler': 'from-blue-500 to-sky-500',
      'Budget Explorer': 'from-green-500 to-teal-500',
      'Smart Traveler': 'from-blue-500 to-indigo-500',
      'Comfort Seeker': 'from-purple-500 to-pink-500',
      'Luxury Traveler': 'from-amber-500 to-orange-500'
    }
    return colors[personality] || 'from-gray-500 to-gray-600'
  }

  const getPlaceTypeColor = (type) => {
    const colors = {
      'Beach': 'bg-blue-100 text-blue-800',
      'Mountain': 'bg-green-100 text-green-800',
      'City': 'bg-purple-100 text-purple-800',
      'Historical': 'bg-amber-100 text-amber-800',
      'Fort': 'bg-amber-100 text-amber-800',
      'Museum': 'bg-amber-100 text-amber-800',
      'Temple': 'bg-amber-100 text-amber-800',
      'Restaurant': 'bg-pink-100 text-pink-800',
      'Shopping': 'bg-indigo-100 text-indigo-800',
      'Entertainment': 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  // Fetch real expense distribution from API
  const [expenseData, setExpenseData] = useState([])
  const [tripsPerMonth, setTripsPerMonth] = useState([])

  // Fetch expense data
  const fetchExpenseData = async () => {
    try {
      const response = await api.get('/api/expenses')
      const expenses = response.data.expenses || []
      
      // Calculate expense distribution from real data
      const categoryTotals = {}
      expenses.forEach(expense => {
        const category = expense.category || 'Other'
        categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount)
      })
      
      const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
      
      // Create expense distribution data
      const expenseDistribution = Object.entries(categoryTotals).map(([category, amount]) => ({
        name: category,
        value: Math.round((amount / totalSpent) * 100),
        color: getCategoryColor(category)
      }))
      
      setExpenseData(expenseDistribution)
    } catch (error) {
      console.error('Error fetching expense data:', error)
      // Fallback to default data
      setExpenseData([
        { name: 'Transport', value: 35, color: '#2563eb' },
        { name: 'Food', value: 25, color: '#10b981' },
        { name: 'Stay', value: 30, color: '#f59e0b' },
        { name: 'Activities', value: 10, color: '#ef4444' }
      ])
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Transport': '#2563eb',
      'Food': '#10b981',
      'Stay': '#f59e0b',
      'Activities': '#ef4444',
      'Shopping': '#8b5cf6',
      'Entertainment': '#ec4899',
      'Other': '#6b7280'
    }
    return colors[category] || '#6b7280'
  }

  // Fetch trips per month data
  const fetchTripsPerMonth = async () => {
    try {
      const response = await api.get('/api/trips')
      const trips = response.data.trips
      
      // Group trips by month
      const monthData = {}
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      trips.forEach(trip => {
        const date = new Date(trip.start_date)
        const monthName = months[date.getMonth()]
        monthData[monthName] = (monthData[monthName] || 0) + 1
      })
      
      // Create array for all months
      const tripsData = months.map(month => ({
        month,
        trips: monthData[month] || 0
      }))
      
      setTripsPerMonth(tripsData)
    } catch (error) {
      console.error('Error fetching trips per month:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 font-bold text-xl">TravelLens</span>
          </div>
          
          <nav className="space-y-2">
            {[
              { icon: BarChart3, label: 'Dashboard', href: '/dashboard', active: true },
              { icon: MapPin, label: 'Trips', href: '/trip-logger' },
              { icon: Compass, label: 'Places', href: '/places-logger' },
              { icon: CreditCard, label: 'Expenses', href: '/expense-tracker' },
              { icon: PieChart, label: 'Insights', href: '/insights' },
              { icon: Target, label: 'Recommendations', href: '/recommendations' }
            ].map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  item.active 
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Travel Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back, {user?.name}! Here's your travel overview
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-gray-900 font-medium">{user?.name}</p>
              <p className="text-gray-600 text-sm">{user?.email}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Trips</h3>
            <p className="text-gray-900 text-3xl font-bold">{animatedStats.totalTrips}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Spent</h3>
            <p className="text-gray-900 text-3xl font-bold">${animatedStats.totalSpent.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <Star className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Places Visited</h3>
            <p className="text-gray-900 text-3xl font-bold">{animatedStats.placesVisited}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <Heart className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Travel Style</h3>
            <p className="text-gray-900 text-lg font-bold">{insights?.travel_personality || 'Adventurer'}</p>
          </div>
        </div>

        {/* Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-gray-900 text-xl font-bold mb-6">Travel Analytics</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-gray-600 text-sm font-medium mb-4">Expense Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <RePieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h4 className="text-gray-600 text-sm font-medium mb-4">Trips This Year</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={tripsPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="trips" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-gray-900 text-xl font-bold mb-6">Travel Insights</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Top Destination</p>
                    <p className="text-gray-600 text-sm">{insights?.most_visited_destination || 'No destinations yet'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Compass className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Favorite Place</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPlaceTypeColor(insights?.favorite_place_category || 'Beach')}`}>
                      {insights?.favorite_place_category || 'No places yet'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Avg Trip Cost</p>
                    <p className="text-gray-600 text-sm">${insights?.average_trip_cost || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Travel Frequency</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{width: `${Math.min(insights?.travel_frequency * 10 || 0, 100)}%`}}></div>
                      </div>
                      <span className="text-gray-600 text-xs">{insights?.travel_frequency || 0}/year</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-900 text-xl font-bold">Recent Adventures</h3>
            <Link 
              to="/trip-logger"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              View All →
            </Link>
          </div>
          
          <div className="space-y-4">
            {trips.map((trip, index) => (
              <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-sky-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{trip.trip_name}</p>
                    <p className="text-gray-600 text-sm">{trip.destination} • {trip.travel_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-medium">${trip.budget.toLocaleString()}</p>
                  <p className="text-gray-600 text-sm">{new Date(trip.start_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
