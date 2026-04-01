import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './design/Themecontext'
import Layout from './design/Layout'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TripLogger from './pages/TripLogger'
import PlacesLogger from './pages/PlacesLogger'
import HotelLogger from './pages/HotelLogger'
import ExpenseTracker from './pages/ExpenseTracker'
import Insights from './pages/Insights'
import Recommendations from './pages/Recommendations'
import Analytics from './pages/analytics'

function AppContent() {
  const { user, logout } = useAuth()

  return (
    <Routes>
      {/* Auth routes — no sidebar */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />

      {/* Protected routes — all wrapped in Layout (sidebar) */}
      <Route path="/dashboard" element={user ? <Layout user={user} onLogout={logout}><Dashboard /></Layout> : <Navigate to="/login" />} />
      <Route path="/trip-logger" element={user ? <Layout user={user} onLogout={logout}><TripLogger /></Layout> : <Navigate to="/login" />} />
      <Route path="/places-logger" element={user ? <Layout user={user} onLogout={logout}><PlacesLogger /></Layout> : <Navigate to="/login" />} />
      <Route path="/hotel-logger" element={user ? <Layout user={user} onLogout={logout}><HotelLogger /></Layout> : <Navigate to="/login" />} />
      <Route path="/expense-tracker" element={user ? <Layout user={user} onLogout={logout}><ExpenseTracker /></Layout> : <Navigate to="/login" />} />
      <Route path="/insights" element={user ? <Layout user={user} onLogout={logout}><Insights /></Layout> : <Navigate to="/login" />} />
      <Route path="/recommendations" element={user ? <Layout user={user} onLogout={logout}><Recommendations /></Layout> : <Navigate to="/login" />} />
      <Route path="/analytics" element={user ? <Layout user={user} onLogout={logout}><Analytics /></Layout> : <Navigate to="/login" />} />

      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App