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
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useTheme()

  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState(null)
  const [trips, setTrips] = useState([])
  const [expenseData, setExpenseData] = useState([])
  const [tripsPerMonth, setTripsPerMonth] = useState([])
  const [hotelStats, setHotelStats] = useState({ total: 0, totalCost: 0 })
  const [placeStats, setPlaceStats] = useState({ total: 0, topCategory: '—' })
  const [recs, setRecs] = useState(null)
  const [animatedStats, setAnimatedStats] = useState({ totalTrips: 0, totalSpent: 0, placesVisited: 0, hotels: 0 })
  const [finalStats, setFinalStats] = useState(null) // triggers animation via useEffect

  useEffect(() => {
    if (user && !authLoading) fetchAll()
  }, [user, authLoading])

  // Animate when finalStats is set
  useEffect(() => {
    if (!finalStats) return
    const keys = Object.keys(finalStats)
    const steps = 50, ms = 1500
    const inc = {}
    keys.forEach(k => { inc[k] = finalStats[k] / steps })
    let s = 0
    const timer = setInterval(() => {
      s++
      if (s < steps) {
        setAnimatedStats(prev => {
          const next = { ...prev }
          keys.forEach(k => { next[k] = Math.floor(inc[k] * s) })
          return next
        })
      } else {
        clearInterval(timer)
        setAnimatedStats({ ...finalStats })
      }
    }, ms / steps)
    return () => clearInterval(timer)
  }, [finalStats])

  const fetchAll = async () => {
    try {
      // ── Step 1: fetch trips, insights, expenses, recommendations in parallel ──
      const [iRes, tRes, eRes, recRes] = await Promise.all([
        api.get(`/api/insights/${user.id}`).catch(() => null),
        api.get('/api/trips').catch(() => null),
        api.get('/api/expenses').catch(() => null),
        api.get(`/api/recommendations/${user.id}`).catch(() => null),
      ])

      const allTrips = tRes?.data?.trips || []
      const insightsData = iRes?.data?.insights || null
      setInsights(insightsData)
      setTrips(allTrips.slice(0, 5))
      setRecs(recRes?.data?.recommendations || null)

      // ── Compute totalTrips and totalSpent from raw data, not just insights ──
      // This ensures counts are correct even if insights API lags behind
      const rawTripCount = allTrips.length
      const rawTripSpend = allTrips.reduce((sum, tr) => sum + parseFloat(tr.budget || tr.total_spent || 0), 0)

      // ── Trips per month ──
      const md = {}
      allTrips.forEach(trip => {
        if (!trip.start_date) return
        const m = MONTHS[new Date(trip.start_date).getMonth()]
        md[m] = (md[m] || 0) + 1
      })
      setTripsPerMonth(MONTHS.map(m => ({ month: m, trips: md[m] || 0 })))

      // ── Expense breakdown ──
      const expenses = eRes?.data?.expenses || []
      const totals = {}
      expenses.forEach(e => {
        const c = e.category || 'Other'
        totals[c] = (totals[c] || 0) + parseFloat(e.amount || 0)
      })
      const expSum = Object.values(totals).reduce((a, b) => a + b, 0)
      setExpenseData(
        expSum > 0
          ? Object.entries(totals).map(([name, amt]) => ({
            name, value: Math.round((amt / expSum) * 100), color: CAT_COLORS[name] || '#6b7280'
          }))
          : []
      )

      // ── Step 2: fetch hotels + places for each trip in parallel ──
      if (allTrips.length > 0) {
        const tripIds = allTrips.map(tr => tr.id)

        const [hotelResults, placeResults] = await Promise.all([
          Promise.all(tripIds.map(id => api.get(`/api/hotels/${id}`).catch(() => null))),
          Promise.all(tripIds.map(id => api.get(`/api/places/${id}`).catch(() => null))),
        ])

        // Hotel stats
        const allHotels = hotelResults.flatMap(r => r?.data?.hotels || [])
        const hotelTotalCost = allHotels.reduce((sum, h) => sum + parseFloat(h.total_cost || h.price_per_night || 0), 0)
        setHotelStats({ total: allHotels.length, totalCost: hotelTotalCost })

        // Place stats
        const allPlaces = placeResults.flatMap(r => r?.data?.places || [])
        const catCount = {}
        allPlaces.forEach(p => {
          const c = p.place_type || p.category || 'Other'
          catCount[c] = (catCount[c] || 0) + 1
        })
        const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
        setPlaceStats({ total: allPlaces.length, topCategory: topCat })

        // Set final stats — useEffect will animate them
        setFinalStats({
          totalTrips: rawTripCount,
          totalSpent: Math.max(rawTripSpend, insightsData?.total_spent || 0),
          placesVisited: allPlaces.length,
          hotels: allHotels.length,
        })
      } else {
        setFinalStats({ totalTrips: rawTripCount, totalSpent: rawTripSpend, placesVisited: 0, hotels: 0 })
      }

    } catch (e) {
      console.error('Dashboard fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) return <Spinner />

  const personality = insights?.travel_personality || 'Adventurer'
  const meta = PERSONALITY_META[personality] || PERSONALITY_META['Adventurer']

  const tooltipStyle = {
    background: t.card, border: `1px solid ${t.border}`,
    borderRadius: 8, color: t.textPrimary, fontSize: 12,
  }

  return (
    <>
      <PageHeader
        title="Travel Dashboard"
        subtitle={`Welcome back, ${user?.name}! Here's your complete travel overview`}
      />

      {/* ── Row 1: Main Stat Cards — all driven from animatedStats computed from raw API data ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Trips" value={animatedStats.totalTrips} icon="✈️" gradient="linear-gradient(135deg,#3b82f6,#6366f1)" />
        <StatCard label="Total Budget" value={`₹${animatedStats.totalSpent.toLocaleString()}`} icon="💸" gradient="linear-gradient(135deg,#10b981,#059669)" />
        <StatCard label="Places Logged" value={animatedStats.placesVisited} icon="📍" gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" />
        <StatCard label="Hotels Stayed" value={animatedStats.hotels} icon="🏨" gradient="linear-gradient(135deg,#f97316,#ea580c)" />
      </div>

      {/* ── Row 2: Charts ── */}
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
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                      <span style={{ fontSize: 12, color: t.textSecondary }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: t.textMuted }}>
              <span style={{ fontSize: 32 }}>💸</span>
              <span style={{ fontSize: 13 }}>No expenses logged yet</span>
              <Link to="/expense-tracker" style={{ fontSize: 12, color: t.blue, fontWeight: 600, textDecoration: 'none' }}>Add expenses →</Link>
            </div>
          )}
        </Card>

        {/* Trips bar chart */}
        <Card>
          <SectionTitle>Trips This Year</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={tripsPerMonth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis dataKey="month" stroke={t.textMuted} tick={{ fontSize: 10, fill: t.textSecondary }} />
              <YAxis stroke={t.textMuted} tick={{ fontSize: 10, fill: t.textSecondary }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="trips" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Row 3: Insights + Hotel/Place/Rec summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Travel Insights */}
        <Card>
          <SectionTitle>Travel Insights</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🌍', bg: '#3b82f6', label: 'Top Destination', value: insights?.most_visited_destination || 'No destinations yet' },
              { icon: '📍', bg: '#10b981', label: 'Fav Place Type', value: placeStats.topCategory, chip: true },
              { icon: '💳', bg: '#8b5cf6', label: 'Avg Trip Cost', value: `$${insights?.average_trip_cost || 0}` },
              { icon: '📅', bg: '#f59e0b', label: 'Travel Frequency', freq: insights?.travel_frequency || 0 },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: t.dark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                  {row.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginBottom: 2 }}>{row.label}</p>
                  {row.freq !== undefined ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: t.dark ? '#1e2f4a' : '#e2e8f0' }}>
                        <div style={{ height: '100%', borderRadius: 2, background: '#f59e0b', width: `${Math.min(row.freq * 10, 100)}%`, transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontSize: 10, color: t.textSecondary }}>{row.freq}/yr</span>
                    </div>
                  ) : row.chip ? (
                    <span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${PLACE_COLORS[row.value] || '#6b7280'}18`, color: PLACE_COLORS[row.value] || t.textSecondary }}>
                      {row.value}
                    </span>
                  ) : (
                    <p style={{ fontSize: 11, color: t.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Hotels + Places quick stats */}
        <Card>
          <SectionTitle>Stays & Places</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Hotel block */}
            <div style={{ borderRadius: 12, padding: '14px 16px', background: 'linear-gradient(135deg,#f97316,#ea580c)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <p style={{ fontSize: 24, marginBottom: 4 }}>🏨</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: "'Playfair Display', serif" }}>{hotelStats.total}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Hotels logged</p>
              {hotelStats.totalCost > 0 && (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>₹{hotelStats.totalCost.toLocaleString()} total</p>
              )}
            </div>
            {/* Places block */}
            <div style={{ borderRadius: 12, padding: '14px 16px', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <p style={{ fontSize: 24, marginBottom: 4 }}>📍</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: "'Playfair Display', serif" }}>{placeStats.total}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Places visited</p>
              {placeStats.topCategory !== '—' && (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>Mostly {placeStats.topCategory}</p>
              )}
            </div>
            <Link to="/hotel-logger" style={{ fontSize: 12, color: t.blue, fontWeight: 600, textDecoration: 'none', textAlign: 'right' }}>Manage stays →</Link>
          </div>
        </Card>

        {/* Travel Personality */}
        <Card style={{ background: t.dark ? `${meta.color}10` : `${meta.color}06`, border: `1px solid ${meta.color}25`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{meta.emoji}</div>
          <p style={{ fontSize: 10, color: t.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Your Travel Persona</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: meta.color, marginBottom: 10 }}>{personality}</h2>
          <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
            {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ fontSize: 13, color: '#f59e0b' }}>★</span>)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <Link to="/insights" style={{ display: 'block', padding: '8px 0', borderRadius: 20, background: meta.color, color: 'white', textDecoration: 'none', fontSize: 12, fontWeight: 600, boxShadow: `0 4px 12px ${meta.color}44` }}>
              View Insights →
            </Link>
            <Link to="/recommendations" style={{ display: 'block', padding: '8px 0', borderRadius: 20, background: t.dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: t.textSecondary, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
              Get Recommendations →
            </Link>
          </div>
        </Card>
      </div>

      {/* ── Row 4: Recommendation preview ── */}
      {recs?.destinations?.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionTitle>🌍 Recommended For You</SectionTitle>
            <Link to="/recommendations" style={{ fontSize: 12, color: t.blue, fontWeight: 600, textDecoration: 'none' }}>See all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
            {recs.destinations.slice(0, 3).map((dest, i) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${t.border}`, background: t.card }}>
                <div style={{ height: 3, background: ['linear-gradient(90deg,#3b82f6,#6366f1)', 'linear-gradient(90deg,#f97316,#ea580c)', 'linear-gradient(90deg,#8b5cf6,#7c3aed)'][i % 3] }} />
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary }}>{dest.name}</p>
                    <Badge color="#3b82f6">{dest.category}</Badge>
                  </div>
                  <p style={{ fontSize: 12, color: t.textSecondary, lineHeight: 1.5 }}>{dest.description?.slice(0, 80)}…</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Row 5: Recent trips ── */}
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