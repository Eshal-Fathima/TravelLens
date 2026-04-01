import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { Spinner } from '../design/UI'
import Navbar from '../components/Navbar'
import {
  BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Link } from 'react-router-dom'

const CAT_COLORS = {
  Transport: '#a3c9ff', Food: '#ffb68b', Stay: '#4ae183',
  Activities: '#ffd700', Shopping: '#c084fc', Other: '#8c919b'
}
const PERSONALITY_META = {
  'Budget Explorer': { emoji: '🎒', color: '#4ae183', tag1: 'SAVVY SPENDER', tag2: 'STREET FOODIE' },
  'Smart Traveler': { emoji: '🧠', color: '#a3c9ff', tag1: 'STRATEGIC', tag2: 'RESEARCHER' },
  'Comfort Seeker': { emoji: '🛋️', color: '#c084fc', tag1: 'COMFORT FIRST', tag2: 'CURATED STAYS' },
  'Luxury Traveler': { emoji: '💎', color: '#ffd700', tag1: 'PREMIUM ONLY', tag2: 'VIP ACCESS' },
  'New Traveler': { emoji: '🌱', color: '#8c919b', tag1: 'JUST STARTED', tag2: 'LEARNING FAST' },
  'Adventurer': { emoji: '🧭', color: '#ffb68b', tag1: 'THRILL SEEKER', tag2: 'OFF-GRID' },
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const themes = {
  light: {
    bg: '#fdfae7', surface: '#f7f4e1', card: '#ece9d6', border: 'rgba(66,71,80,0.12)',
    textPrimary: '#1c1c11', textSecond: '#424750', textMuted: '#727781',
    primary: '#003461', primaryFaded: '#004b8718', accent: '#1b6d24', accentFaded: '#1b6d2418',
  },
  dark: {
    bg: '#111125', surface: '#1e1e32', card: '#1e1e32', border: 'rgba(66,71,80,0.35)',
    textPrimary: '#e2e0fc', textSecond: '#c2c6d1', textMuted: '#8c919b',
    primary: '#a3c9ff', primaryFaded: '#a3c9ff14', accent: '#4ae183', accentFaded: '#4ae18314',
  }
}

function Icon({ name, fill = 0, size = 22, style = {} }) {
  return (
    <span className="material-symbols-outlined" style={{
      fontVariationSettings: `'FILL' ${fill},'wght' 400,'GRAD' 0,'opsz' ${size}`,
      fontSize: size, lineHeight: 1, display: 'inline-flex', alignItems: 'center', ...style
    }}>{name}</span>
  )
}

function StatTile({ icon, label, value, trend, trendUp, t }) {
  return (
    <div style={{ background: t.card, borderRadius: 20, padding: '24px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 148, border: `1px solid ${t.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Icon name={icon} size={22} style={{ color: t.primary }} />
        {trend && <span style={{ fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2, color: trendUp ? t.accent : '#ff6b6b', fontFamily: 'Manrope' }}>
          {trend} <Icon name={trendUp ? 'trending_up' : 'trending_down'} size={14} />
        </span>}
      </div>
      <div>
        <p style={{ fontSize: 32, fontWeight: 900, color: t.textPrimary, fontFamily: 'Manrope', letterSpacing: '-1.5px', margin: 0, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: t.textMuted, fontFamily: 'Manrope', margin: '6px 0 0' }}>{label}</p>
      </div>
    </div>
  )
}

function TripCard({ trip, gradient }) {
  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', height: 290, background: gradient, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.72) 0%,transparent 55%)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '20px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)', padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '1.5px', border: '1px solid rgba(255,255,255,0.18)', fontFamily: 'Manrope' }}>
            {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
          </span>
          <span style={{ background: 'rgba(74,225,131,0.85)', padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, color: '#002204', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Manrope' }}>
            {trip.travel_type || 'Completed'}
          </span>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: '0 0 4px', fontFamily: 'Manrope' }}>{trip.trip_name}</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Manrope' }}>
          <Icon name="location_on" size={13} style={{ color: 'rgba(255,255,255,0.55)' }} />
          {trip.destination} · ₹{trip.budget?.toLocaleString()}
        </p>
        <Link to={`/trip/${trip.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'white', fontWeight: 700, fontSize: 12, background: 'rgba(163,201,255,0.18)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(163,201,255,0.22)', fontFamily: 'Manrope' }}>
          View Details <Icon name="open_in_new" size={13} />
        </Link>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const { dark } = useTheme()
  const [isDark, setIsDark] = useState(dark ?? true)
  const t = themes[isDark ? 'dark' : 'light']
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState(null)
  const [trips, setTrips] = useState([])
  const [expenseData, setExpenseData] = useState([])
  const [tripsPerMonth, setTripsPerMonth] = useState([])
  const [hotelStats, setHotelStats] = useState({ total: 0, totalCost: 0 })
  const [placeStats, setPlaceStats] = useState({ total: 0, topCategory: '—' })
  const [recs, setRecs] = useState(null)
  const [animatedStats, setAnimatedStats] = useState({ totalTrips: 0, totalSpent: 0, placesVisited: 0, hotels: 0 })
  const [finalStats, setFinalStats] = useState(null)

  useEffect(() => { if (user && !authLoading) fetchAll() }, [user, authLoading])

  useEffect(() => {
    if (!finalStats) return
    const keys = Object.keys(finalStats)
    const steps = 50, ms = 1500, inc = {}
    keys.forEach(k => { inc[k] = finalStats[k] / steps })
    let s = 0
    const timer = setInterval(() => {
      s++
      if (s < steps) {
        setAnimatedStats(prev => { const n = { ...prev }; keys.forEach(k => { n[k] = Math.floor(inc[k] * s) }); return n })
      } else { clearInterval(timer); setAnimatedStats({ ...finalStats }) }
    }, ms / steps)
    return () => clearInterval(timer)
  }, [finalStats])

  const fetchAll = async () => {
    try {
      const [iRes, tRes, eRes, recRes] = await Promise.all([
        api.get(`/api/insights/${user.id}`).catch(() => null),
        api.get('/api/trips').catch(() => null),
        api.get('/api/expenses').catch(() => null),
        api.get(`/api/recommendations/${user.id}`).catch(() => null),
      ])
      const allTrips = tRes?.data?.trips || []
      const insightsData = iRes?.data?.insights || null
      setInsights(insightsData); setTrips(allTrips.slice(0, 4)); setRecs(recRes?.data?.recommendations || null)
      const rawCount = allTrips.length
      const rawSpend = allTrips.reduce((s, tr) => s + parseFloat(tr.budget || tr.total_spent || 0), 0)
      const md = {}
      allTrips.forEach(trip => { if (!trip.start_date) return; const m = MONTHS[new Date(trip.start_date).getMonth()]; md[m] = (md[m] || 0) + 1 })
      setTripsPerMonth(MONTHS.map(m => ({ month: m, trips: md[m] || 0 })))
      const expenses = eRes?.data?.expenses || []
      const totals = {}
      expenses.forEach(e => { const c = e.category || 'Other'; totals[c] = (totals[c] || 0) + parseFloat(e.amount || 0) })
      const expSum = Object.values(totals).reduce((a, b) => a + b, 0)
      setExpenseData(expSum > 0 ? Object.entries(totals).map(([name, amt]) => ({ name, value: Math.round((amt / expSum) * 100), color: CAT_COLORS[name] || '#8c919b' })) : [])
      if (allTrips.length > 0) {
        const ids = allTrips.map(tr => tr.id)
        const [hRes, pRes] = await Promise.all([
          Promise.all(ids.map(id => api.get(`/api/hotels/${id}`).catch(() => null))),
          Promise.all(ids.map(id => api.get(`/api/places/${id}`).catch(() => null))),
        ])
        const allH = hRes.flatMap(r => r?.data?.hotels || [])
        setHotelStats({ total: allH.length, totalCost: allH.reduce((s, h) => s + parseFloat(h.total_cost || h.price_per_night || 0), 0) })
        const allP = pRes.flatMap(r => r?.data?.places || [])
        const cc = {}; allP.forEach(p => { const c = p.place_type || p.category || 'Other'; cc[c] = (cc[c] || 0) + 1 })
        setPlaceStats({ total: allP.length, topCategory: Object.entries(cc).sort((a, b) => b[1] - a[1])[0]?.[0] || '—' })
        setFinalStats({ totalTrips: rawCount, totalSpent: Math.max(rawSpend, insightsData?.total_spent || 0), placesVisited: allP.length, hotels: allH.length })
      } else {
        setFinalStats({ totalTrips: rawCount, totalSpent: rawSpend, placesVisited: 0, hotels: 0 })
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  if (authLoading || loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: themes.dark.bg }}><Spinner /></div>

  const personality = insights?.travel_personality || 'Adventurer'
  const meta = PERSONALITY_META[personality] || PERSONALITY_META['Adventurer']
  const GRADS = ['linear-gradient(145deg,#002244,#003461)', 'linear-gradient(145deg,#003d1e,#1b6d24)', 'linear-gradient(145deg,#4a1a00,#7c2e19)', 'linear-gradient(145deg,#2d1b69,#5b21b6)']
  const tooltipStyle = { background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, color: t.textPrimary, fontSize: 12, fontFamily: 'Manrope' }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Manrope,sans-serif', transition: 'background 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Lora:ital,wght@1,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; display:inline-flex;align-items:center;line-height:1; }
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:${t.border};border-radius:4px;}
        .rec-hover:hover{transform:translateX(3px);}
        .act-btn:hover{background:${t.primary}!important;color:${isDark ? '#00315c' : 'white'}!important;}
        .act-btn:hover span{color:${isDark ? '#00315c' : 'white'}!important;}
        @media(min-width:900px){
          .g12{grid-template-columns:repeat(12,1fr)!important;}
          .c8{grid-column:span 8/span 8!important;}
          .c4{grid-column:span 4/span 4!important;}
          .c7{grid-column:span 7/span 7!important;}
          .c5{grid-column:span 5/span 5!important;}
          .c4b{grid-column:span 4/span 4!important;}
          .c12{grid-column:span 12/span 12!important;}
          .mob-nav{display:none!important;}
        }
        @media(max-width:899px){.mob-nav{display:flex!important;}}
      `}</style>

      {/* TOP NAVBAR */}
      <Navbar user={user} isDark={isDark} onToggleTheme={() => setIsDark(p => !p)} />

      <main style={{ paddingTop: 64 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '36px 28px 100px' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: t.accent, marginBottom: 10, fontFamily: 'Manrope' }}>Explorer Overview</p>
              <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-1.5px', color: t.textPrimary, lineHeight: 1.1, fontFamily: 'Manrope', margin: 0 }}>
                Welcome back,{' '}
                <span style={{ color: t.textMuted, fontStyle: 'italic', fontFamily: 'Lora,serif', fontWeight: 700 }}>{user?.name}.</span>
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.card, borderRadius: 16, padding: '14px 20px', border: `1px solid ${t.border}`, borderLeft: `4px solid ${meta.color}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{meta.emoji}</div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: t.textMuted, margin: 0 }}>Travel Persona</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: meta.color, fontFamily: 'Manrope', margin: 0 }}>{personality}</p>
              </div>
            </div>
          </div>

          {/* Stat Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
            <StatTile icon="flight_takeoff" label="Total Trips" value={animatedStats.totalTrips} trend="+3" trendUp t={t} />
            <StatTile icon="payments" label="Total Budget" value={`₹${animatedStats.totalSpent.toLocaleString()}`} trend="-5%" trendUp={false} t={t} />
            <StatTile icon="location_on" label="Places Logged" value={animatedStats.placesVisited} trend="+8" trendUp t={t} />
            <StatTile icon="hotel" label="Hotels Stayed" value={animatedStats.hotels} t={t} />
          </div>

          {/* Bento Grid */}
          <div className="g12" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>

            {/* Recent Trips */}
            <div className="c8" style={{ gridColumn: 'span 12' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: t.textPrimary, display: 'flex', alignItems: 'center', gap: 12, margin: 0, fontFamily: 'Manrope' }}>
                  Recent Expeditions
                  <span style={{ height: 2, width: 40, background: `${t.accent}40`, display: 'inline-block', borderRadius: 2 }} />
                </h2>
                <Link to="/trip-logger" style={{ fontSize: 13, color: t.primary, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Manrope' }}>
                  View All <Icon name="arrow_forward" size={16} />
                </Link>
              </div>
              {trips.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 16 }}>
                  {trips.map((trip, i) => <TripCard key={trip.id} trip={trip} gradient={GRADS[i % GRADS.length]} />)}
                </div>
              ) : (
                <div style={{ borderRadius: 20, border: `2px dashed ${t.border}`, padding: '52px 24px', textAlign: 'center', background: t.card }}>
                  <p style={{ fontSize: 36, marginBottom: 12 }}>✈️</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 6, fontFamily: 'Manrope' }}>No adventures yet</p>
                  <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 20, fontFamily: 'Manrope' }}>Start logging your trips</p>
                  <Link to="/trip-logger" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, textDecoration: 'none', background: `linear-gradient(135deg,${t.primary},${t.accent}44)`, color: t.textPrimary, fontWeight: 700, fontSize: 14, fontFamily: 'Manrope' }}>
                    <Icon name="add" size={18} /> Log First Trip
                  </Link>
                </div>
              )}
            </div>

            {/* AI + Quick Actions */}
            <div className="c4" style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: t.card, borderRadius: 20, padding: 24, border: `1px solid ${t.border}`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: `${t.primary}08`, filter: 'blur(24px)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Icon name="auto_awesome" size={18} fill={1} style={{ color: t.primary }} />
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: t.primary, fontFamily: 'Manrope' }}>AI Insights</span>
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary, marginBottom: 8, fontFamily: 'Manrope' }}>Based on your love for {personality}...</h4>
                <p style={{ fontSize: 13, color: t.textSecond, lineHeight: 1.6, marginBottom: 18, fontFamily: 'Manrope' }}>
                  You might love exploring <span style={{ color: t.accent, fontWeight: 700 }}>hidden gems</span> tailored to your travel style.
                </p>
                {(recs?.destinations?.slice(0, 2) || []).map((dest, i) => (
                  <div key={i} className="rec-hover" style={{ background: t.surface, padding: '13px 15px', borderRadius: 12, marginBottom: 10, cursor: 'pointer', transition: 'transform 0.2s', border: `1px solid ${t.border}` }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? t.accent : '#ffb68b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4, fontFamily: 'Manrope' }}>{i === 0 ? 'TOP PICK' : 'TRENDING'}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, fontFamily: 'Manrope' }}>{dest.name}</p>
                    <p style={{ fontSize: 11, color: t.textMuted, marginTop: 2, fontFamily: 'Manrope' }}>{dest.category} · {dest.description?.slice(0, 40)}…</p>
                  </div>
                ))}
                {(!recs?.destinations || recs.destinations.length === 0) && <>
                  <div className="rec-hover" style={{ background: t.surface, padding: '13px 15px', borderRadius: 12, marginBottom: 10, cursor: 'pointer', transition: 'transform 0.2s', border: `1px solid ${t.border}` }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4, fontFamily: 'Manrope' }}>ACTIVITY IDEA</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, fontFamily: 'Manrope' }}>Night Kayaking at Chilika Lake</p>
                    <p style={{ fontSize: 11, color: t.textMuted, marginTop: 2, fontFamily: 'Manrope' }}>Odisha · Bioluminescent experience</p>
                  </div>
                  <div className="rec-hover" style={{ background: t.surface, padding: '13px 15px', borderRadius: 12, marginBottom: 10, cursor: 'pointer', transition: 'transform 0.2s', border: `1px solid ${t.border}` }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#ffb68b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4, fontFamily: 'Manrope' }}>TRENDING NOW</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, fontFamily: 'Manrope' }}>Valley of Flowers Trek</p>
                    <p style={{ fontSize: 11, color: t.textMuted, marginTop: 2, fontFamily: 'Manrope' }}>Uttarakhand · UNESCO Heritage</p>
                  </div>
                </>}
                <Link to="/recommendations" style={{ display: 'block', marginTop: 8, padding: '10px', borderRadius: 12, textAlign: 'center', border: `1px solid ${t.border}`, color: t.primary, fontWeight: 700, fontSize: 12, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'Manrope' }}>
                  More Suggestions
                </Link>
              </div>

              <div style={{ background: t.card, borderRadius: 20, padding: 22, border: `1px solid ${t.border}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary, marginBottom: 14, textAlign: 'center', fontFamily: 'Manrope' }}>Quick Journaling</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { to: '/trip-logger', icon: 'edit_square', label: 'Log New Trip' },
                    { to: '/expense-tracker', icon: 'payments', label: 'Add Expense' },
                    { to: '/hotel-logger', icon: 'hotel', label: 'Add Hotel Stay' },
                  ].map(({ to, icon, label }) => (
                    <Link key={to} to={to} className="act-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', borderRadius: 12, textDecoration: 'none', background: t.surface, color: t.textPrimary, border: `1px solid ${t.border}`, fontFamily: 'Manrope', fontWeight: 600, fontSize: 13, transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name={icon} size={19} style={{ color: t.primary }} />{label}
                      </div>
                      <Icon name="chevron_right" size={17} style={{ color: t.textMuted }} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="c7" style={{ gridColumn: 'span 12', background: t.card, borderRadius: 20, padding: 24, border: `1px solid ${t.border}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: t.textMuted, marginBottom: 4, fontFamily: 'Manrope' }}>Activity</p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: t.textPrimary, marginBottom: 20, fontFamily: 'Manrope' }}>Trips This Year</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={tripsPerMonth} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
                  <XAxis dataKey="month" stroke={t.textMuted} tick={{ fontSize: 10, fill: t.textSecond, fontFamily: 'Manrope' }} />
                  <YAxis stroke={t.textMuted} tick={{ fontSize: 10, fill: t.textSecond, fontFamily: 'Manrope' }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="trips" fill={t.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="c5" style={{ gridColumn: 'span 12', background: t.card, borderRadius: 20, padding: 24, border: `1px solid ${t.border}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: t.textMuted, marginBottom: 4, fontFamily: 'Manrope' }}>Breakdown</p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: t.textPrimary, marginBottom: 20, fontFamily: 'Manrope' }}>Expense Distribution</h3>
              {expenseData.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <ResponsiveContainer width="45%" height={160}>
                    <RePieChart>
                      <Pie data={expenseData} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={4} dataKey="value">
                        {expenseData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {expenseData.map(item => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: t.textSecond, fontFamily: 'Manrope' }}>{item.name}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: t.textPrimary, fontFamily: 'Manrope' }}>{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: t.textMuted }}>
                  <Icon name="payments" size={32} />
                  <span style={{ fontSize: 13, fontFamily: 'Manrope' }}>No expenses logged yet</span>
                  <Link to="/expense-tracker" style={{ fontSize: 12, color: t.primary, fontWeight: 700, textDecoration: 'none', fontFamily: 'Manrope' }}>Add expenses →</Link>
                </div>
              )}
            </div>

            {/* Travel Insights */}
            <div className="c4b" style={{ gridColumn: 'span 12', background: t.card, borderRadius: 20, padding: 24, border: `1px solid ${t.border}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: t.textMuted, marginBottom: 4, fontFamily: 'Manrope' }}>Analytics</p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: t.textPrimary, marginBottom: 18, fontFamily: 'Manrope' }}>Travel Insights</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: 'public', label: 'Top Destination', value: insights?.most_visited_destination || 'No data yet', color: t.primary },
                  { icon: 'location_on', label: 'Fav Place Type', value: placeStats.topCategory, color: t.accent },
                  { icon: 'credit_card', label: 'Avg Trip Cost', value: `₹${insights?.average_trip_cost || 0}`, color: '#c084fc' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: t.surface, border: `1px solid ${t.border}` }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${row.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name={row.icon} size={18} style={{ color: row.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: t.textMuted, marginBottom: 2, fontFamily: 'Manrope' }}>{row.label}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Manrope' }}>{row.value}</p>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '12px 14px', borderRadius: 12, background: t.surface, border: `1px solid ${t.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ffd70018', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="calendar_month" size={18} style={{ color: '#ffd700' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: t.textMuted, marginBottom: 2, fontFamily: 'Manrope' }}>Travel Frequency</p>
                      <p style={{ fontSize: 11, color: t.textSecond, fontFamily: 'Manrope' }}>{insights?.travel_frequency || 0} trips/yr</p>
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: t.border }}>
                    <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#ffd700,#ffb68b)', width: `${Math.min((insights?.travel_frequency || 0) * 10, 100)}%`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Stays & Places */}
            <div className="c4b" style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'linear-gradient(145deg,#4a1a00,#7c2e19)', borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden', flex: 1 }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <Icon name="hotel" size={26} style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 10, display: 'block' }} />
                <p style={{ fontSize: 34, fontWeight: 900, color: 'white', fontFamily: 'Manrope', letterSpacing: '-1.5px', margin: 0 }}>{hotelStats.total}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600, margin: '4px 0 0', fontFamily: 'Manrope' }}>Hotels Logged</p>
                {hotelStats.totalCost > 0 && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4, fontFamily: 'Manrope' }}>₹{hotelStats.totalCost.toLocaleString()} total</p>}
              </div>
              <div style={{ background: 'linear-gradient(145deg,#2d1b69,#5b21b6)', borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden', flex: 1 }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <Icon name="location_on" size={26} style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 10, display: 'block' }} />
                <p style={{ fontSize: 34, fontWeight: 900, color: 'white', fontFamily: 'Manrope', letterSpacing: '-1.5px', margin: 0 }}>{placeStats.total}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600, margin: '4px 0 0', fontFamily: 'Manrope' }}>Places Visited</p>
                {placeStats.topCategory !== '—' && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4, fontFamily: 'Manrope' }}>Mostly {placeStats.topCategory}</p>}
              </div>
            </div>

            {/* Persona Card */}
            <div className="c4b" style={{ gridColumn: 'span 12', background: `linear-gradient(145deg,${t.primary}15,${meta.color}0d)`, borderRadius: 20, padding: 32, border: `1px solid ${meta.color}28`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: 50, marginBottom: 10 }}>{meta.emoji}</div>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: t.textMuted, marginBottom: 6, fontFamily: 'Manrope' }}>Member Persona</p>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: meta.color, marginBottom: 6, fontFamily: 'Manrope' }}>{personality}</h2>
              <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ fontSize: 14, color: '#ffd700' }}>★</span>)}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ padding: '4px 10px', background: 'rgba(128,128,128,0.12)', borderRadius: 999, fontSize: 9, fontWeight: 700, color: t.textSecond, letterSpacing: '1.5px', fontFamily: 'Manrope' }}>{meta.tag1}</span>
                <span style={{ padding: '4px 10px', background: 'rgba(128,128,128,0.12)', borderRadius: 999, fontSize: 9, fontWeight: 700, color: t.textSecond, letterSpacing: '1.5px', fontFamily: 'Manrope' }}>{meta.tag2}</span>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/insights" style={{ display: 'block', padding: '11px', borderRadius: 12, background: meta.color, color: isDark ? '#0c0c1f' : 'white', textDecoration: 'none', fontSize: 12, fontWeight: 700, boxShadow: `0 4px 16px ${meta.color}44`, fontFamily: 'Manrope', textTransform: 'uppercase', letterSpacing: '1px' }}>View Insights →</Link>
                <Link to="/recommendations" style={{ display: 'block', padding: '11px', borderRadius: 12, background: t.surface, color: t.textSecond, textDecoration: 'none', fontSize: 12, fontWeight: 700, fontFamily: 'Manrope', border: `1px solid ${t.border}`, textTransform: 'uppercase', letterSpacing: '1px' }}>Get Recommendations →</Link>
              </div>
            </div>

            {/* Reflection Banner */}
            <div className="c12" style={{ gridColumn: 'span 12', background: `linear-gradient(135deg,${t.card},${t.surface})`, borderRadius: 20, padding: '26px 30px', border: `1px solid ${t.border}`, borderLeft: `4px solid ${t.primary}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: t.textPrimary, marginBottom: 5, fontFamily: 'Manrope' }}>2025 Reflection Journal</h3>
                <p style={{ fontSize: 13, color: t.textSecond, fontFamily: 'Manrope' }}>{animatedStats.totalTrips > 0 ? `You've explored ${animatedStats.totalTrips} destinations this year. Keep wandering.` : 'Start logging trips to build your travel story.'}</p>
              </div>
              <Link to="/insights" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: t.primaryFaded, borderRadius: 12, border: `1px solid ${t.border}`, color: t.primary, fontWeight: 700, fontSize: 13, textDecoration: 'none', fontFamily: 'Manrope', whiteSpace: 'nowrap' }}>
                Annual Recap <Icon name="arrow_right_alt" size={20} />
              </Link>
            </div>

          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mob-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: isDark ? 'rgba(17,17,37,0.92)' : 'rgba(253,250,231,0.92)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${t.border}`, zIndex: 50, justifyContent: 'space-around', alignItems: 'center', padding: '10px 16px' }}>
        {[
          { to: '/dashboard', icon: 'dashboard', label: 'Home', active: true },
          { to: '/trip-logger', icon: 'map', label: 'Trips', active: false },
          { to: '/expense-tracker', icon: 'payments', label: 'Spend', active: false },
          { to: '/insights', icon: 'auto_awesome', label: 'AI', active: false },
        ].map(link => (
          <Link key={link.to} to={link.to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: link.active ? t.accent : t.textMuted }}>
            <Icon name={link.icon} size={22} fill={link.active ? 1 : 0} />
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Manrope' }}>{link.label}</span>
          </Link>
        ))}
        <Link to="/trip-logger" style={{ width: 48, height: 48, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -24, boxShadow: `0 4px 16px ${t.accent}44`, textDecoration: 'none' }}>
          <Icon name="add" size={22} style={{ color: isDark ? '#002204' : 'white' }} />
        </Link>
      </nav>
    </div>
  )
}