import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TripLogger from './pages/TripLogger'
import PlacesLogger from './pages/PlacesLogger'
import HotelLogger from './pages/HotelLogger'
import ExpenseTracker from './pages/ExpenseTracker'
import Insights from './pages/Insights'
import Recommendations from './pages/Recommendations'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar user={user} setUser={logout} />}
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/signup" 
          element={!user ? <Signup /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/trip-logger" 
          element={user ? <TripLogger /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/places-logger" 
          element={user ? <PlacesLogger /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/hotel-logger" 
          element={user ? <HotelLogger /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/expense-tracker" 
          element={user ? <ExpenseTracker /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/insights" 
          element={user ? <Insights /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/recommendations" 
          element={user ? <Recommendations /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
