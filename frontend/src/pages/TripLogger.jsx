import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'

/* ─── Theme tokens ───────────────────────────────────────────────────── */
const themes = {
  light: {
    bg: '#fdfae7',
    surface: '#f7f4e1',
    card: '#ffffff',
    border: 'rgba(66,71,80,0.12)',
    textPrimary: '#1c1c11',
    textSecond: '#424750',
    textMuted: '#727781',
    primary: '#003461',
    primaryFaded: '#004b8718',
    accent: '#1b6d24',
    accentFaded: '#1b6d2418',
  },
  dark: {
    bg: '#0a0a0a',
    surface: '#141414',
    card: '#1a1a1a',
    border: 'rgba(255,255,255,0.08)',
    textPrimary: '#f0f0f0',
    textSecond: '#b0b0b0',
    textMuted: '#666666',
    primary: '#a3c9ff',
    primaryFaded: '#a3c9ff14',
    accent: '#4ae183',
    accentFaded: '#4ae18314',
  },
}

const TRAVEL_COLORS = {
  Solo: { accent: '#a3c9ff', icon: '🧭' },
  Family: { accent: '#4ae183', icon: '🏡' },
  Friends: { accent: '#ffb68b', icon: '🎉' },
}

const defaultForm = {
  trip_name: '', destination: '', start_date: '',
  end_date: '', budget: '', travel_type: 'Solo',
}

/* ─── Icons ──────────────────────────────────────────────────────────── */
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)
const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
const WalletIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </svg>
)
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const FlagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
)

/* ─── Helpers ────────────────────────────────────────────────────────── */
const getDuration = (start, end) => {
  const d = Math.ceil((new Date(end) - new Date(start)) / 86400000)
  return d > 0 ? `${d} day${d > 1 ? 's' : ''}` : null
}
const fmtDate = (iso, opts) => new Date(iso).toLocaleDateString('en-IN', opts)
const fmtMonth = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()

const flattenTrips = (trips) => trips.map((t, i) => ({ ...t, _globalIdx: i }))

const groupByMonth = (trips) => {
  const map = {}
  trips.forEach(t => {
    const key = fmtMonth(t.start_date)
    if (!map[key]) map[key] = []
    map[key].push(t)
  })
  return Object.entries(map)
}

/* ─── TripCard ───────────────────────────────────────────────────────── */
function TripCard({ trip, tripNumber, onEdit, onDelete, t, isDark }) {
  const { accent, icon } = TRAVEL_COLORS[trip.travel_type] || TRAVEL_COLORS.Solo
  const duration = getDuration(trip.start_date, trip.end_date)

  return (
    <div
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'transform 0.22s, box-shadow 0.22s',
        fontFamily: 'Manrope, sans-serif',
        boxShadow: isDark
          ? '0px 12px 32px rgba(0,0,0,0.35)'
          : '0px 12px 32px rgba(28,28,17,0.06)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = isDark
          ? '0 16px 48px rgba(0,0,0,0.55)'
          : '0 16px 48px rgba(28,28,17,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = isDark
          ? '0px 12px 32px rgba(0,0,0,0.35)'
          : '0px 12px 32px rgba(28,28,17,0.06)'
      }}
    >
      {/* accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}55)` }} />

      <div style={{ padding: '20px 22px' }}>
        {/* trip number + actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <p style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '2px',
              textTransform: 'uppercase', color: t.textMuted,
              margin: '0 0 6px', fontFamily: 'Manrope, sans-serif',
            }}>
              Trip {String(tripNumber).padStart(2, '0')}
            </p>
            <h3 style={{
              fontSize: 16, fontWeight: 800, color: t.textPrimary,
              margin: '0 0 6px', fontFamily: 'Manrope, sans-serif',
              letterSpacing: '-0.3px',
            }}>{trip.trip_name}</h3>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, letterSpacing: '1.2px',
              textTransform: 'uppercase',
              padding: '3px 9px', borderRadius: 999,
              background: accent + '18', color: accent,
              border: `1px solid ${accent}30`,
              fontFamily: 'Manrope, sans-serif',
            }}>
              {icon} {trip.travel_type}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => onEdit(trip)}
              style={{
                width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.border}`,
                background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: t.textMuted, transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = t.primaryFaded; e.currentTarget.style.color = t.primary }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted }}
            ><EditIcon /></button>
            <button
              onClick={() => onDelete(trip.id)}
              style={{
                width: 30, height: 30, borderRadius: 8,
                border: '1px solid rgba(239,68,68,0.25)',
                background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ef4444', transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.10)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            ><TrashIcon /></button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: t.textSecond, fontFamily: 'Manrope, sans-serif' }}>
            <PinIcon />{trip.destination}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: t.textSecond, fontFamily: 'Manrope, sans-serif', flexWrap: 'wrap' }}>
            <CalIcon />
            {fmtDate(trip.start_date, { month: 'short', day: 'numeric' })} –{' '}
            {fmtDate(trip.end_date, { month: 'short', day: 'numeric', year: 'numeric' })}
            {duration && (
              <span style={{
                fontSize: 10, padding: '1px 7px', borderRadius: 999,
                background: accent + '15', color: accent, fontWeight: 700,
              }}>{duration}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: t.textSecond, fontFamily: 'Manrope, sans-serif' }}>
            <WalletIcon />
            Budget: <strong style={{ color: t.textPrimary, fontWeight: 800 }}>
              ₹{trip.budget?.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Modal ──────────────────────────────────────────────────────────── */
function TripModal({ title, onClose, t, isDark, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.40)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'tl-fade-in 0.18s ease',
      }}
    >
      <div style={{
        background: t.card, border: `1px solid ${t.border}`,
        borderRadius: 24, padding: 32,
        width: '100%', maxWidth: 500,
        boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
        animation: 'tl-slide-up 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: 'Manrope, sans-serif',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
          <h2 style={{
            fontSize: 22, fontWeight: 900, letterSpacing: '-0.5px',
            color: t.textPrimary, fontFamily: 'Manrope, sans-serif', margin: 0,
          }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: t.surface, border: `1px solid ${t.border}`,
              color: t.textMuted, cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.primaryFaded; e.currentTarget.style.color = t.primary }}
            onMouseLeave={e => { e.currentTarget.style.background = t.surface; e.currentTarget.style.color = t.textMuted }}
          ><CloseIcon /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ─── Form helpers ───────────────────────────────────────────────────── */
function FieldLabel({ children, t }) {
  return (
    <label style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '1.5px',
      textTransform: 'uppercase', color: t.textMuted,
      fontFamily: 'Manrope, sans-serif', display: 'block', marginBottom: 6,
    }}>{children}</label>
  )
}
function TlInput({ t, ...props }) {
  return (
    <input
      style={{
        width: '100%', background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: 12, padding: '11px 14px', color: t.textPrimary,
        fontFamily: 'Manrope, sans-serif', fontSize: 13,
        outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onFocus={e => { e.target.style.borderColor = t.primary; e.target.style.boxShadow = `0 0 0 3px ${t.primaryFaded}` }}
      onBlur={e => { e.target.style.borderColor = t.border; e.target.style.boxShadow = 'none' }}
      {...props}
    />
  )
}
function TlSelect({ t, children, ...props }) {
  return (
    <select
      style={{
        width: '100%', background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: 12, padding: '11px 14px', color: t.textPrimary,
        fontFamily: 'Manrope, sans-serif', fontSize: 13,
        outline: 'none', cursor: 'pointer', appearance: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onFocus={e => { e.target.style.borderColor = t.primary; e.target.style.boxShadow = `0 0 0 3px ${t.primaryFaded}` }}
      onBlur={e => { e.target.style.borderColor = t.border; e.target.style.boxShadow = 'none' }}
      {...props}
    >{children}</select>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function TripLogger() {
  const { dark } = useTheme()
  const [isDark, setIsDark] = useState(dark ?? false)
  useEffect(() => { if (dark !== undefined) setIsDark(dark) }, [dark])
  const t = themes[isDark ? 'dark' : 'light']

  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => { fetchTrips() }, [])

  const fetchTrips = async () => {
    try {
      const r = await api.get('/api/trips')
      setTrips(r.data.trips)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const openNew = () => { setForm(defaultForm); setEditing(null); setShowForm(true) }
  const openEdit = (trip) => {
    setEditing(trip)
    setForm({
      trip_name: trip.trip_name,
      destination: trip.destination,
      start_date: trip.start_date?.split('T')[0] || '',
      end_date: trip.end_date?.split('T')[0] || '',
      budget: trip.budget?.toString() || '',
      travel_type: trip.travel_type,
    })
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form, budget: parseFloat(form.budget) }
    if (isNaN(data.budget) || data.budget <= 0) { alert('Enter a valid budget'); return }
    try {
      if (editing) await api.put(`/api/trips/${editing.id}`, data)
      else await api.post('/api/trips', data)
      fetchTrips(); closeForm()
    } catch (err) { console.error(err); alert('Error saving trip.') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip?')) return
    try { await api.delete(`/api/trips/${id}`); fetchTrips() }
    catch (e) { console.error(e) }
  }

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  })

  const flat = flattenTrips(trips)
  const grouped = groupByMonth(flat)

  const nodeDotActive = isDark ? t.accent : t.primary
  const nodeFg = isDark ? '#002204' : '#ffffff'
  const pathColor = isDark ? '#a3c9ff' : '#003461'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Lora:ital,wght@1,700&display=swap');
        * { box-sizing: border-box; }
        @keyframes tl-fade-in  { from{opacity:0} to{opacity:1} }
        @keyframes tl-slide-up { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes tl-spin     { to{transform:rotate(360deg)} }
        @keyframes tl-ping     { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.8);opacity:0} }
      `}</style>

      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Manrope, sans-serif', transition: 'background 0.3s' }}>

        {/* dot-grid background */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `radial-gradient(${isDark ? 'rgba(163,201,255,0.07)' : 'rgba(0,52,97,0.06)'} 1px, transparent 1px)`,
          backgroundSize: '38px 38px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '0 24px 100px' }}>

          {/* ── Nav ── */}
          <nav style={{
            position: 'sticky', top: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            height: 68,
            background: isDark ? 'rgba(10,10,10,0.80)' : 'rgba(253,250,231,0.85)',
            backdropFilter: 'blur(18px)',
            borderBottom: `1px solid ${t.border}`,
            margin: '0 -24px', padding: '0 24px',
          }}>
            <div style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '3px',
              textTransform: 'uppercase', color: t.accent,
              fontFamily: 'Manrope, sans-serif',
            }}>Travel Journal</div>
            <button
              onClick={openNew}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: t.primary, color: isDark ? '#001e3c' : '#fff',
                padding: '10px 22px', borderRadius: 12,
                fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700,
                border: 'none', cursor: 'pointer', transition: 'transform 0.18s, opacity 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '.85'; e.currentTarget.style.transform = 'scale(1.03)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              <PlusIcon /> New Trip
            </button>
          </nav>

          {/* ── Page header ── */}
          <header style={{ maxWidth: 900, margin: '48px auto 40px' }}>
            <p style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '3px', color: t.accent, marginBottom: 10,
              fontFamily: 'Manrope, sans-serif',
            }}>Adventure Quest</p>
            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 62px)', fontWeight: 900,
              letterSpacing: '-2px', color: t.primary,
              lineHeight: 1, fontFamily: 'Manrope, sans-serif', margin: 0,
            }}>
              Your Journey{' '}
              <em style={{ fontFamily: 'Lora, serif', fontWeight: 700, color: t.accent, fontStyle: 'italic' }}>Log.</em>
            </h1>
          </header>

          {/* ── Body ── */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `3px solid ${t.border}`, borderTopColor: t.primary,
                animation: 'tl-spin 0.8s linear infinite',
              }} />
            </div>

          ) : trips.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 24px',
              borderRadius: 20, border: `2px dashed ${t.border}`, background: t.card,
            }}>
              <p style={{ fontSize: 42, marginBottom: 14 }}>✈️</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: t.textPrimary, marginBottom: 6, fontFamily: 'Manrope, sans-serif' }}>No trips logged yet</p>
              <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 24, fontFamily: 'Manrope, sans-serif' }}>Start building your travel journal</p>
              <button
                onClick={openNew}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 12,
                  background: t.primary, color: isDark ? '#001e3c' : '#fff',
                  fontWeight: 700, fontSize: 14,
                  fontFamily: 'Manrope, sans-serif', cursor: 'pointer', border: 'none',
                }}
              ><PlusIcon /> Log First Trip</button>
            </div>

          ) : (
            /* ── Winding path timeline ── */
            <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>

              {/* decorative winding SVG path */}
              <svg
                style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%', height: '100%',
                  pointerEvents: 'none', opacity: 0.18,
                }}
                preserveAspectRatio="none"
                viewBox="0 0 100 1000"
              >
                <path
                  d="M50,0 Q80,100 50,200 T50,400 T30,600 T70,800 T50,1000"
                  fill="none"
                  stroke={pathColor}
                  strokeDasharray="8 8"
                  strokeWidth="2"
                />
              </svg>

              {grouped.map(([month, monthTrips]) => (
                <div key={month} style={{ marginBottom: 48 }}>

                  {/* Month pill */}
                  <div style={{ position: 'relative', zIndex: 2, marginBottom: 28 }}>
                    <div style={{
                      display: 'inline-block',
                      background: t.surface, padding: '5px 16px', borderRadius: 999,
                      border: `1px solid ${t.border}`,
                      boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(28,28,17,0.06)',
                    }}>
                      <span style={{
                        fontSize: 11, fontWeight: 800, letterSpacing: '3px',
                        textTransform: 'uppercase', color: t.primary,
                        fontFamily: 'Manrope, sans-serif',
                      }}>{month}</span>
                    </div>
                  </div>

                  {/* Trip rows */}
                  {monthTrips.map((trip) => {
                    const goLeft = trip._globalIdx % 2 === 0

                    return (
                      <div
                        key={trip.id}
                        style={{
                          position: 'relative', zIndex: 2,
                          display: 'grid',
                          gridTemplateColumns: '1fr 56px 1fr',
                          alignItems: 'center',
                          gap: '0 16px',
                          marginBottom: 40,
                        }}
                      >
                        {/* LEFT slot */}
                        <div style={{ gridColumn: 1 }}>
                          {goLeft && (
                            <TripCard
                              trip={trip}
                              tripNumber={trip._globalIdx + 1}
                              onEdit={openEdit}
                              onDelete={handleDelete}
                              t={t}
                              isDark={isDark}
                            />
                          )}
                        </div>

                        {/* CENTRE — flag node on every trip */}
                        <div style={{
                          gridColumn: 2,
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          position: 'relative',
                        }}>
                          <div style={{ position: 'relative' }}>
                            <div style={{
                              position: 'absolute', inset: 0, borderRadius: '50%',
                              border: `2px solid ${nodeDotActive}`,
                              animation: 'tl-ping 2s cubic-bezier(0,0,0.2,1) infinite',
                            }} />
                            <div style={{
                              width: 46, height: 46, borderRadius: '50%',
                              background: nodeDotActive, color: nodeFg,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: `0 0 0 5px ${t.primaryFaded}, 0 0 20px ${t.primaryFaded}`,
                              position: 'relative', zIndex: 1,
                            }}>
                              <FlagIcon />
                            </div>
                          </div>
                        </div>

                        {/* RIGHT slot */}
                        <div style={{ gridColumn: 3 }}>
                          {!goLeft && (
                            <TripCard
                              trip={trip}
                              tripNumber={trip._globalIdx + 1}
                              onEdit={openEdit}
                              onDelete={handleDelete}
                              t={t}
                              isDark={isDark}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <TripModal title={editing ? 'Edit Trip' : 'Log New Trip'} onClose={closeForm} t={t} isDark={isDark}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <FieldLabel t={t}>Trip Name</FieldLabel>
              <TlInput t={t} placeholder="e.g. Monsoon Escape to Coorg" required {...f('trip_name')} />
            </div>

            <div>
              <FieldLabel t={t}>Destination</FieldLabel>
              <TlInput t={t} placeholder="e.g. Coorg, Karnataka" required {...f('destination')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <FieldLabel t={t}>Start Date</FieldLabel>
                <TlInput t={t} type="date" required {...f('start_date')} />
              </div>
              <div>
                <FieldLabel t={t}>End Date</FieldLabel>
                <TlInput t={t} type="date" required min={form.start_date} {...f('end_date')} />
              </div>
            </div>

            <div>
              <FieldLabel t={t}>Budget (₹)</FieldLabel>
              <TlInput t={t} type="number" min="0" step="0.01" placeholder="e.g. 25000" required {...f('budget')} />
            </div>

            <div>
              <FieldLabel t={t}>Travel Type</FieldLabel>
              <TlSelect t={t} required {...f('travel_type')}>
                {['Solo', 'Family', 'Friends'].map(v => <option key={v} value={v}>{v}</option>)}
              </TlSelect>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                type="submit"
                style={{
                  flex: 1, padding: 13,
                  background: t.primary, color: isDark ? '#001e3c' : '#fff',
                  border: 'none', borderRadius: 12, cursor: 'pointer',
                  fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 700,
                  transition: 'opacity 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '.85' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >{editing ? 'Save Changes' : 'Log Trip'}</button>

              <button
                type="button"
                onClick={closeForm}
                style={{
                  flex: 1, padding: 13,
                  background: t.surface, border: `1px solid ${t.border}`,
                  color: t.textSecond, borderRadius: 12, cursor: 'pointer',
                  fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 600,
                  transition: 'background 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = t.card }}
                onMouseLeave={e => { e.currentTarget.style.background = t.surface }}
              >Cancel</button>
            </div>
          </form>
        </TripModal>
      )}
    </>
  )
}