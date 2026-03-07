import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { PageHeader, Card, StatCard, Spinner, EmptyState, SectionTitle, Badge } from '../design/UI'
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'

const CAT_COLORS = {
  Transport: '#3b82f6', Food: '#ef4444', Stay: '#10b981',
  Activities: '#f59e0b', Shopping: '#8b5cf6', Other: '#6b7280'
}

const PLACE_COLORS = {
  Beach: '#3b82f6', Mountain: '#10b981', City: '#8b5cf6',
  Historical: '#f59e0b', Fort: '#f59e0b', Museum: '#8b5cf6',
  Temple: '#f97316', Restaurant: '#ec4899', Shopping: '#6366f1'
}

const PERSONALITY_META = {
  'Budget Explorer': { emoji: '🎒', color: '#10b981' },
  'Smart Traveler': { emoji: '🧠', color: '#3b82f6' },
  'Comfort Seeker': { emoji: '🛋️', color: '#8b5cf6' },
  'Luxury Traveler': { emoji: '💎', color: '#f59e0b' },
  'New Traveler': { emoji: '🌱', color: '#6b7280' },
  'Adventurer': { emoji: '🧭', color: '#f97316' },
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useTheme()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState([])
  const [expenseData, setExpenseData] = useState([])
  const [tripsPerMonth, setTripsPerMonth] = useState([])
  const [animatedStats, setAnimatedStats] = useState({ totalTrips: 0, totalSpent: 0, placesVisited: 0 })

  useEffect(() => {
    if (user && !authLoading) fetchAll()
  }, [user, authLoading])

  useEffect(() => {
    if (!insights) return
    const steps = 60, ms = 2000
    const inc = {
      totalTrips: (insights.total_trips || 0) / steps,
      totalSpent: (insights.total_spent || 0) / steps,
      placesVisited: (insights.countries_visited || 0) / steps,
    }
    let s = 0
    const timer = setInterval(() => {
      s++
      if (s <= steps) {
        setAnimatedStats({
          totalTrips: Math.floor(inc.totalTrips * s),
          totalSpent: Math.floor(inc.totalSpent * s),
          placesVisited: Math.floor(inc.placesVisited * s),
        })
      } else {
        clearInterval(timer)
        setAnimatedStats({
          totalTrips: insights.total_trips || 0,
          totalSpent: insights.total_spent || 0,
          placesVisited: insights.countries_visited || 0,
        })
      }
    }, ms / steps)
    return () => clearInterval(timer)
  }, [insights])

  const fetchAll = async () => {
    try {
      const [iRes, tRes] = await Promise.all([
        api.get(`/api/insights/${user.id}`),
        api.get('/api/trips'),
      ])
      setInsights(iRes.data.insights)
      setTrips(tRes.data.trips.slice(0, 5))
      await Promise.all([fetchExpenseData(), fetchTripsPerMonth()])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchExpenseData = async () => {
    try {
      const res = await api.get('/api/expenses')
      const expenses = res.data.expenses || []
      const totals = {}
      expenses.forEach(e => {
        const c = e.category || 'Other'
        totals[c] = (totals[c] || 0) + parseFloat(e.amount)
      })
      const sum = Object.values(totals).reduce((a, b) => a + b, 0)
      setExpenseData(Object.entries(totals).map(([name, amt]) => ({
        name, value: Math.round((amt / sum) * 100), color: CAT_COLORS[name] || '#6b7280'
      })))
    } catch {
      setExpenseData([
        { name: 'Transport', value: 35, color: '#3b82f6' },
        { name: 'Food', value: 25, color: '#ef4444' },
        { name: 'Stay', value: 30, color: '#10b981' },
        { name: 'Activities', value: 10, color: '#f59e0b' },
      ])
    }
  }

  const fetchTripsPerMonth = async () => {
    try {
      const res = await api.get('/api/trips')
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const md = {}
      res.data.trips.forEach(trip => {
        const m = months[new Date(trip.start_date).getMonth()]
        md[m] = (md[m] || 0) + 1
      })
      setTripsPerMonth(months.map(m => ({ month: m, trips: md[m] || 0 })))
    } catch (e) { console.error(e) }
  }

  if (authLoading || loading) return <Spinner />

  const personality = insights?.travel_personality || 'Adventurer'
  const meta = PERSONALITY_META[personality] || PERSONALITY_META['Adventurer']

  const tooltipStyle = {
    background: t.card,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    color: t.textPrimary,
    fontSize: 12,
  }

  return (
    <>
      <PageHeader
        title="Travel Dashboard"
        subtitle={`Welcome back, ${user?.name}! Here's your travel overview`}
      />

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Trips" value={animatedStats.totalTrips} icon="✈️" gradient="linear-gradient(135deg,#3b82f6,#6366f1)" />
        <StatCard label="Total Spent" value={`$${animatedStats.totalSpent.toLocaleString()}`} icon="💸" gradient="linear-gradient(135deg,#10b981,#059669)" />
        <StatCard label="Places Visited" value={animatedStats.placesVisited} icon="📍" gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" />
        <StatCard label="Travel Style" value={`${meta.emoji} ${personality}`} icon="🧭" gradient="linear-gradient(135deg,#f97316,#ea580c)" />
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Expense Pie */}
        <Card>
          <SectionTitle>Expense Distribution</SectionTitle>
          {expenseData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width="50%" height={160}>
                <RePieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={4} dataKey="value">
                    {expenseData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </RePieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {expenseData.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: t.textSecondary }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted, fontSize: 13 }}>
              💸 No expense data yet
            </div>
          )}
        </Card>

        {/* Bar chart */}
        <Card>
          <SectionTitle>Trips This Year</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={tripsPerMonth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis dataKey="month" stroke={t.textMuted} tick={{ fontSize: 10, fill: t.textSecondary }} />
              <YAxis stroke={t.textMuted} tick={{ fontSize: 10, fill: t.textSecondary }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="trips" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Insights + Personality ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Travel Insights */}
        <Card>
          <SectionTitle>Travel Insights</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🌍', bg: '#3b82f6', label: 'Top Destination', value: insights?.most_visited_destination || 'No destinations yet' },
              { icon: '📍', bg: '#10b981', label: 'Favorite Place', value: insights?.favorite_place_category || 'No places yet', chip: true },
              { icon: '💳', bg: '#8b5cf6', label: 'Avg Trip Cost', value: `$${insights?.average_trip_cost || 0}` },
              { icon: '📅', bg: '#f59e0b', label: 'Travel Frequency', freq: insights?.travel_frequency || 0 },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: t.dark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {row.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 2 }}>{row.label}</p>
                  {row.freq !== undefined ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: t.dark ? '#1e2f4a' : '#e2e8f0' }}>
                        <div style={{ height: '100%', borderRadius: 3, background: '#f59e0b', width: `${Math.min(row.freq * 10, 100)}%`, transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontSize: 11, color: t.textSecondary }}>{row.freq}/yr</span>
                    </div>
                  ) : row.chip ? (
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${PLACE_COLORS[row.value] || '#6b7280'}18`, color: PLACE_COLORS[row.value] || t.textSecondary }}>
                      {row.value}
                    </span>
                  ) : (
                    <p style={{ fontSize: 12, color: t.textSecondary }}>{row.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Travel Personality — mirrors the Insights.jsx hero card style */}
        <Card style={{ background: t.dark ? `${meta.color}10` : `${meta.color}06`, border: `1px solid ${meta.color}25`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>{meta.emoji}</div>
          <p style={{ fontSize: 11, color: t.textSecondary, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Your Travel Persona</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: meta.color, marginBottom: 10 }}>{personality}</h2>
          <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ fontSize: 14, color: '#f59e0b' }}>★</span>)}
          </div>
          <Link to="/insights" style={{
            display: 'inline-block', padding: '8px 20px', borderRadius: 20,
            background: meta.color, color: 'white', textDecoration: 'none',
            fontSize: 13, fontWeight: 600, boxShadow: `0 4px 12px ${meta.color}44`,
          }}>
            View Full Insights →
          </Link>
        </Card>
      </div>

      {/* ── Recent Adventures ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <SectionTitle>Recent Adventures</SectionTitle>
          <Link to="/trip-logger" style={{ fontSize: 13, color: t.blue, fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
        </div>

        {trips.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {trips.map(trip => (
              <div key={trip.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 12,
                background: t.dark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    📍
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary, marginBottom: 2 }}>{trip.trip_name}</p>
                    <p style={{ fontSize: 12, color: t.textSecondary }}>{trip.destination} · {trip.travel_type}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary, fontFamily: "'Playfair Display', serif" }}>₹{trip.budget?.toLocaleString()}</p>
                  <p style={{ fontSize: 11, color: t.textSecondary }}>{new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="✈️"
            title="No adventures yet"
            desc="Start logging your trips to see them here"
            action={
              <Link to="/trip-logger" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                + Log First Trip
              </Link>
            }
          />
        )}
      </Card>
    </>
  )
}