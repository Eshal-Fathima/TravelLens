import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { Plus, Edit2, Trash2, CreditCard, DollarSign, PieChartIcon, Save, X, Filter } from 'lucide-react'
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Legend, Tooltip, Pie } from 'recharts'

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expenseSummary, setExpenseSummary] = useState(null)
  const [formData, setFormData] = useState({
    trip_id: '',
    category: 'Transport',
    amount: '',
    description: ''
  })

  const categories = ['Transport', 'Food', 'Stay', 'Activities', 'Shopping', 'Other']
  
  const COLORS = {
    'Transport': '#3B82F6',
    'Food': '#EF4444',
    'Stay': '#10B981',
    'Activities': '#F59E0B',
    'Shopping': '#8B5CF6',
    'Other': '#6B7280'
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  useEffect(() => {
    if (selectedTrip) {
      fetchExpenses(selectedTrip)
      fetchExpenseSummary(selectedTrip)
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

  const fetchExpenses = async (tripId) => {
    try {
      setLoading(true)
      const response = await api.get(`/api/expenses/${tripId}`)
      setExpenses(response.data.expenses)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExpenseSummary = async (tripId) => {
    try {
      const response = await api.get(`/api/expenses/${tripId}/summary`)
      setExpenseSummary(response.data)
    } catch (error) {
      console.error('Error fetching expense summary:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      trip_id: selectedTrip,
      category: 'Transport',
      amount: '',
      description: ''
    })
    setEditingExpense(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      }

      if (editingExpense) {
        await api.put(`/api/expenses/${editingExpense.id}`, data)
      } else {
        await api.post('/api/expenses', data)
      }
      
      fetchExpenses(selectedTrip)
      fetchExpenseSummary(selectedTrip)
      resetForm()
    } catch (error) {
      console.error('Error saving expense:', error)
      alert('Error saving expense. Please try again.')
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      trip_id: expense.trip_id,
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/api/expenses/${expenseId}`)
        fetchExpenses(selectedTrip)
        fetchExpenseSummary(selectedTrip)
      } catch (error) {
        console.error('Error deleting expense:', error)
        alert('Error deleting expense. Please try again.')
      }
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Transport': 'bg-blue-100 text-blue-800',
      'Food': 'bg-red-100 text-red-800',
      'Stay': 'bg-green-100 text-green-800',
      'Activities': 'bg-yellow-100 text-yellow-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors['Other']
  }

  const pieChartData = expenseSummary?.category_breakdown 
    ? Object.entries(expenseSummary.category_breakdown).map(([category, amount]) => ({
        name: category,
        value: parseFloat(amount),
        color: COLORS[category]
      }))
    : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="text-gray-600 mt-2">Track and analyze your travel expenses</p>
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
          <span>Add Expense</span>
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

      {/* Expense Summary and Chart */}
      {selectedTrip && expenseSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Summary Cards */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Expenses</span>
                <span className="text-2xl font-bold text-gray-900">₹{expenseSummary.total_expenses?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Number of Expenses</span>
                <span className="font-medium text-gray-900">{expenseSummary.expense_count}</span>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Category Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(expenseSummary.category_breakdown).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{category}</span>
                      <span className="font-medium text-gray-900">₹{parseFloat(amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Distribution</h2>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No expense data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
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
                <label className="label">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input resize-none"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Flight tickets to Goa..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingExpense ? 'Update' : 'Add'} Expense</span>
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

      {/* Expenses List */}
      {selectedTrip ? (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : expenses.length > 0 ? (
            expenses.map((expense) => (
              <div key={expense.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CreditCard className="h-5 w-5 text-primary-600" />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">₹{expense.amount?.toLocaleString()}</span>
                    </div>
                    
                    {expense.description && (
                      <p className="text-gray-600 text-sm mt-2">{expense.description}</p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(expense.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
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
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses added yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your travel expenses</p>
              <button
                onClick={() => {
                  setFormData({...formData, trip_id: selectedTrip})
                  setShowForm(true)
                }}
                className="btn-primary"
              >
                Add Your First Expense
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a trip</h3>
          <p className="text-gray-600">Choose a trip to start tracking expenses</p>
        </div>
      )}
    </div>
  )
}

export default ExpenseTracker
