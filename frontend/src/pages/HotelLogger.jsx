import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { Spinner, EmptyState } from '../design/UI'

// ─── Theme tokens (same pattern as TripLogger) ────────────────────────────────
const themes = {
  light: {
    bg: '#fdfae7',
    surface: '#f7f4e1',
    card: '#ffffff',
    cardLow: '#f7f4e1',
    cardMid: '#f1eedb',
    cardHigh: '#ece9d6',
    cardHighest: '#e6e3d0',
    border: 'rgba(66,71,80,0.12)',
    textPrimary: '#1c1c11',
    textSecond: '#424750',
    textMuted: '#727781',
    primary: '#003461',
    primaryFaded: '#004b8718',
    primaryFixed: '#d3e4ff',
    accent: '#1b6d24',
    accentFaded: '#1b6d2418',
    tertiary: '#611a07',
    nodeBg: '#003461',
    nodeFg: '#ffffff',
    nodeInactiveBg: '#e6e3d0',
    nodeInactiveFg: '#727781',
    pathColor: 'rgba(0,52,97,0.15)',
  },
  dark: {
    bg: '#0a0a0a',
    surface: '#141414',
    card: '#1a1a1a',
    cardLow: '#141414',
    cardMid: '#1f1f1f',
    cardHigh: '#2a2a2a',
    cardHighest: '#353535',
    border: 'rgba(255,255,255,0.08)',
    textPrimary: '#f0f0f0',
    textSecond: '#b0b0b0',
    textMuted: '#666666',
    primary: '#a3c9ff',
    primaryFaded: '#a3c9ff14',
    primaryFixed: '#a3c9ff20',
    accent: '#4ae183',
    accentFaded: '#4ae18314',
    tertiary: '#ffb4a1',
    nodeBg: '#a3c9ff',
    nodeFg: '#001e3c',
    nodeInactiveBg: '#2a2a2a',
    nodeInactiveFg: '#555',
    pathColor: 'rgba(163,201,255,0.12)',
  },
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const HotelIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
  </svg>
)

const defaultForm = { trip_id: '', hotel_name: '', cost_per_night: '', nights: '' }

export default function HotelLogger() {
  const { dark: ctxDark } = useTheme()
  const [isDark, setIsDark] = useState(ctxDark ?? false)
  useEffect(() => { if (ctxDark !== undefined) setIsDark(ctxDark) }, [ctxDark])
  const t = themes[isDark ? 'dark' : 'light']

  const [hotels, setHotels] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [tripDropOpen, setTripDropOpen] = useState(false)

  // Close dropdown on outside click
  useEffect(() => {
    if (!tripDropOpen) return
    const handler = (e) => { if (!e.target.closest('[data-trip-dropdown]')) setTripDropOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [tripDropOpen])

  useEffect(() => {
    api.get('/api/trips').then(r => {
      setTrips(r.data.trips)
      if (r.data.trips.length > 0) setSelectedTrip(r.data.trips[0].id)
    }).catch(console.error)
  }, [])

  useEffect(() => { if (selectedTrip) fetchHotels() }, [selectedTrip])

  const fetchHotels = async () => {
    setLoading(true)
    try { const r = await api.get(`/api/hotels/${selectedTrip}`); setHotels(r.data.hotels) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const openNew = () => { setForm({ ...defaultForm, trip_id: selectedTrip }); setEditing(null); setShowForm(true) }
  const openEdit = (h) => {
    setEditing(h)
    setForm({ trip_id: h.trip_id, hotel_name: h.hotel_name, cost_per_night: h.cost_per_night.toString(), nights: h.nights.toString() })
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const cost = parseFloat(form.cost_per_night)
      const nights = parseInt(form.nights)
      if (isNaN(cost) || cost <= 0) { alert('Please enter a valid cost per night.'); return }
      if (isNaN(nights) || nights <= 0) { alert('Please enter a valid number of nights.'); return }
      const data = { trip_id: parseInt(form.trip_id), hotel_name: form.hotel_name.trim(), cost_per_night: cost, nights }
      if (editing) await api.put(`/api/hotels/${editing.id}`, data)
      else await api.post('/api/hotels', data)
      fetchHotels(); closeForm()
    } catch (err) { console.error(err); alert('Error saving hotel.') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hotel?')) return
    try { await api.delete(`/api/hotels/${id}`); fetchHotels() }
    catch (e) { console.error(e) }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) })
  const totalCost = (parseFloat(form.cost_per_night) || 0) * (parseInt(form.nights) || 0)
  const totalAccommodation = hotels.reduce((sum, h) => sum + (h.total_cost || 0), 0)
  const totalNights = hotels.reduce((sum, h) => sum + h.nights, 0)
  const selectedTripObj = trips.find(tr => String(tr.id) === String(selectedTrip))

  const inputStyle = {
    width: '100%', background: isDark ? themes.dark.cardHigh : themes.light.surface,
    border: `1px solid ${t.border}`, borderRadius: 10,
    padding: '10px 12px', color: t.textPrimary,
    fontFamily: 'Manrope, sans-serif', fontSize: 13, outline: 'none',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Lora:ital,wght@0,700;1,700&display=swap');
        * { box-sizing: border-box; }
        @keyframes hl-fade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hl-ping  { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.8);opacity:0} }
        .hl-card { transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s; }
        .hl-card:hover { transform: scale(1.015); }
        .hl-btn  { transition: opacity 0.18s, transform 0.18s; cursor: pointer; }
        .hl-btn:hover  { opacity: 0.85; transform: scale(1.02); }
        .hl-stat { transition: transform 0.2s; cursor: default; }
        .hl-stat:hover { transform: translateY(-3px); }
      `}</style>

      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Manrope, sans-serif', transition: 'background 0.3s' }}>

        {/* dot-grid */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `radial-gradient(${isDark ? 'rgba(163,201,255,0.07)' : 'rgba(0,52,97,0.06)'} 1px, transparent 1px)`,
          backgroundSize: '38px 38px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '48px 24px 120px' }}>

          {/* ── Page Header ── */}
          <header style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end',
            gap: 16, marginBottom: 36, animation: 'hl-fade 0.45s ease both',
            position: 'relative', zIndex: 100,  // ← FIX: header sits above all content below
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: t.accent, margin: '0 0 10px' }}>
                Inventory of Rest
              </p>
              <h1 style={{
                fontSize: 'clamp(30px,5vw,52px)', fontWeight: 900, letterSpacing: '-2px',
                color: t.primary, lineHeight: 1, margin: 0, fontFamily: 'Manrope, sans-serif',
              }}>The Accommodation Register</h1>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Trip selector */}
              <div data-trip-dropdown style={{ position: 'relative', zIndex: 200 }}>  {/* ← FIX: high z-index on dropdown wrapper */}
                <button
                  onClick={() => setTripDropOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px', borderRadius: 12,
                    background: t.cardHigh, border: `1px solid ${t.border}`,
                    color: t.textSecond, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.primary}
                  onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
                >
                  <span>🗺️</span>
                  <span style={{ color: t.textPrimary, fontWeight: 700 }}>
                    {selectedTripObj ? selectedTripObj.trip_name : 'Select Trip'}
                  </span>
                  <ChevronIcon />
                </button>
                {tripDropOpen && (
                  <div style={{
                    position: 'absolute', top: '110%', left: 0, zIndex: 9999,
                    background: isDark ? t.card : '#fff',
                    border: `1px solid ${t.border}`, borderRadius: 14, minWidth: 260,
                    boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.7)' : '0 24px 60px rgba(28,28,17,0.18)',
                    overflow: 'hidden',
                  }}>
                    {trips.map(tr => (
                      <button key={tr.id} onClick={() => { setSelectedTrip(tr.id); setTripDropOpen(false) }}
                        style={{
                          width: '100%', textAlign: 'left', padding: '13px 18px',
                          background: String(tr.id) === String(selectedTrip) ? t.primaryFaded : 'transparent',
                          border: 'none', borderBottom: `1px solid ${t.border}`,
                          cursor: 'pointer', fontSize: 13, fontWeight: 600,
                          color: String(tr.id) === String(selectedTrip) ? t.primary : t.textSecond,
                          fontFamily: 'Manrope, sans-serif', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (String(tr.id) !== String(selectedTrip)) e.currentTarget.style.background = isDark ? t.cardHigh : t.cardLow }}
                        onMouseLeave={e => { if (String(tr.id) !== String(selectedTrip)) e.currentTarget.style.background = 'transparent' }}
                      >
                        {tr.trip_name} — {tr.destination}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="hl-btn"
                onClick={openNew}
                disabled={!selectedTrip}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 22px', borderRadius: 12, border: 'none',
                  background: selectedTrip ? t.primary : t.cardHigh,
                  color: selectedTrip ? (isDark ? '#001e3c' : '#fff') : t.textMuted,
                  fontSize: 13, fontWeight: 700, fontFamily: 'Manrope, sans-serif',
                }}
              >
                <PlusIcon /> Add Hotel
              </button>
            </div>
          </header>

          {/* ── Stat Cards ── */}
          {hotels.length > 0 && (
            <section style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              gap: 16, marginBottom: 48,
              animation: 'hl-fade 0.45s 0.08s ease both',
              position: 'relative', zIndex: 1,  // ← FIX: kept below header
            }}>
              {/* Total Accommodation — left border accent */}
              <div className="hl-stat" style={{
                borderRadius: 16, padding: '28px 24px',
                background: isDark ? t.card : t.cardLow,
                border: `1px solid ${t.border}`,
                borderLeft: `4px solid ${t.primary}`,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(28,28,17,0.06)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', bottom: -10, right: -10, fontSize: 64, opacity: 0.06 }}>💳</div>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 12px' }}>
                  Total Accommodation
                </p>
                <h2 style={{ fontSize: 30, fontWeight: 700, color: t.primary, margin: 0, fontFamily: 'Lora, serif', fontStyle: 'italic' }}>
                  ₹{totalAccommodation.toLocaleString('en-IN')}
                </h2>
              </div>

              {/* Hotels Logged */}
              <div className="hl-stat" style={{
                borderRadius: 16, padding: '28px 24px',
                background: isDark ? t.cardHigh : t.cardHighest,
                border: `1px solid ${t.border}`,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(28,28,17,0.06)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', bottom: -10, right: -10, fontSize: 64, opacity: 0.06 }}>🏨</div>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 12px' }}>
                  Hotels Logged
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
                  <h2 style={{ fontSize: 36, fontWeight: 900, color: t.textPrimary, margin: 0, fontFamily: 'Lora, serif', lineHeight: 1 }}>
                    {hotels.length}
                  </h2>
                  <span style={{ fontSize: 13, color: t.textMuted, marginBottom: 3 }}>properties</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: isDark ? t.cardHighest : t.cardMid, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((hotels.length / 20) * 100, 100)}%`, background: t.primary, borderRadius: 2 }} />
                </div>
              </div>

              {/* Total Nights */}
              <div className="hl-stat" style={{
                borderRadius: 16, padding: '28px 24px',
                background: isDark ? t.card : t.cardLow,
                border: `1px solid ${t.border}`,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(28,28,17,0.06)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', bottom: -10, right: -10, fontSize: 64, opacity: 0.06 }}>🌙</div>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 12px' }}>
                  Total Nights
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <h2 style={{ fontSize: 36, fontWeight: 900, color: t.textPrimary, margin: 0, fontFamily: 'Lora, serif', lineHeight: 1 }}>
                    {totalNights}
                  </h2>
                  <span style={{ fontSize: 14, color: t.textMuted }}>Nights</span>
                </div>
              </div>
            </section>
          )}

          {/* ── Winding Path Timeline ── */}
          <div style={{ position: 'relative', zIndex: 1 }}>  {/* ← FIX: timeline kept below header */}
            {selectedTrip ? (
              loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${t.border}`, borderTopColor: t.primary, animation: 'hl-spin 0.8s linear infinite' }} />
                </div>
              ) : hotels.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', animation: 'hl-fade 0.45s ease both' }}>
                  <p style={{ fontSize: 48, marginBottom: 14 }}>🏨</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: t.textPrimary, margin: '0 0 8px' }}>No hotels logged</p>
                  <p style={{ fontSize: 13, color: t.textMuted, margin: '0 0 24px' }}>Add your accommodation details for this trip</p>
                  <button className="hl-btn" onClick={openNew} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: 12, border: 'none',
                    background: t.primary, color: isDark ? '#001e3c' : '#fff',
                    fontSize: 13, fontWeight: 700, fontFamily: 'Manrope, sans-serif',
                  }}><PlusIcon /> Add First Hotel</button>
                </div>
              ) : (
                <div style={{ position: 'relative', maxWidth: 820, margin: '0 auto', animation: 'hl-fade 0.45s 0.16s ease both' }}>

                  {/* Winding path SVG */}
                  <svg style={{
                    position: 'absolute', top: 0, left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%', height: '100%',
                    pointerEvents: 'none', opacity: 0.15,
                  }} preserveAspectRatio="none" viewBox="0 0 100 1000">
                    <path
                      d="M50,0 Q80,100 50,200 T50,400 T30,600 T70,800 T50,1000"
                      fill="none" stroke={isDark ? '#a3c9ff' : '#003461'}
                      strokeDasharray="8 8" strokeWidth="2"
                    />
                  </svg>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                    {hotels.map((hotel, idx) => {
                      const goLeft = idx % 2 === 0
                      const isFirst = idx === 0

                      return (
                        <div key={hotel.id} style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 64px 1fr',
                          alignItems: 'center',
                          gap: '0 16px',
                          position: 'relative', zIndex: 2,
                        }}>
                          {/* LEFT slot */}
                          <div style={{ gridColumn: 1 }}>
                            {goLeft && (
                              <HotelCard hotel={hotel} idx={idx} onEdit={openEdit} onDelete={handleDelete} t={t} isDark={isDark} />
                            )}
                          </div>

                          {/* CENTRE — node */}
                          <div style={{ gridColumn: 2, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            {isFirst ? (
                              <div style={{ position: 'relative' }}>
                                <div style={{
                                  position: 'absolute', inset: 0, borderRadius: '50%',
                                  border: `2px solid ${t.nodeBg}`,
                                  animation: 'hl-ping 2s cubic-bezier(0,0,0.2,1) infinite',
                                }} />
                                <div style={{
                                  width: 48, height: 48, borderRadius: '50%',
                                  background: t.nodeBg, color: t.nodeFg,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  boxShadow: `0 0 0 6px ${t.primaryFaded}, 0 0 24px ${t.primaryFaded}`,
                                  position: 'relative', zIndex: 1,
                                }}>
                                  <HotelIcon />
                                </div>
                              </div>
                            ) : (
                              <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: t.nodeInactiveBg,
                                border: `2px solid ${t.border}`,
                                color: t.nodeInactiveFg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <HotelIcon />
                              </div>
                            )}
                          </div>

                          {/* RIGHT slot */}
                          <div style={{ gridColumn: 3 }}>
                            {!goLeft && (
                              <HotelCard hotel={hotel} idx={idx} onEdit={openEdit} onDelete={handleDelete} t={t} isDark={isDark} />
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* Add next waypoint placeholder */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      opacity: 0.45, marginTop: 8,
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        border: `2px dashed ${t.primary}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: t.primary, cursor: 'pointer', transition: 'opacity 0.2s',
                      }} onClick={openNew}>
                        <PlusIcon />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, fontStyle: 'italic', color: t.primary, margin: 0, fontFamily: 'Lora, serif' }}>
                        Map your next waypoint…
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <p style={{ fontSize: 48, marginBottom: 14 }}>🏨</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, margin: '0 0 6px' }}>Select a trip</p>
                <p style={{ fontSize: 13, color: t.textMuted }}>Choose a trip to view and add hotels</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div
          onClick={e => e.target === e.currentTarget && closeForm()}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div style={{
            background: isDark ? themes.dark.card : '#fff',
            border: `1px solid ${t.border}`,
            borderRadius: 24, padding: 32, width: '100%', maxWidth: 480,
            boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
            fontFamily: 'Manrope, sans-serif',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: t.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>
                {editing ? 'Edit Hotel' : 'Add Hotel'}
              </h2>
              <button onClick={closeForm} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted }}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Trip</label>
                <select {...f('trip_id')} required style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="">Select a trip…</option>
                  {trips.map(tr => <option key={tr.id} value={tr.id}>{tr.trip_name} — {tr.destination}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Hotel Name</label>
                <input {...f('hotel_name')} required placeholder="Taj Resort & Convention Centre" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Cost / Night (₹)</label>
                  <input {...f('cost_per_night')} type="number" required min="0" step="0.01" placeholder="8000" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Nights</label>
                  <input {...f('nights')} type="number" required min="1" placeholder="4" style={inputStyle} />
                </div>
              </div>

              {/* Live total preview */}
              {totalCost > 0 && (
                <div style={{
                  padding: '12px 16px', borderRadius: 12,
                  background: t.primaryFaded, border: `1px solid ${t.primary}25`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, color: t.primary, fontWeight: 700 }}>Total Cost</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: t.primary, fontFamily: 'Lora, serif' }}>
                    ₹{totalCost.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" className="hl-btn" style={{
                  flex: 1, padding: 13, borderRadius: 12, border: 'none',
                  background: t.primary, color: isDark ? '#001e3c' : '#fff',
                  fontWeight: 700, fontSize: 14, fontFamily: 'Manrope, sans-serif',
                }}>{editing ? 'Update' : 'Add'} Hotel</button>
                <button type="button" onClick={closeForm} style={{
                  flex: 1, padding: 13, borderRadius: 12,
                  background: isDark ? t.cardHigh : t.cardMid,
                  border: `1px solid ${t.border}`,
                  color: t.textSecond, fontWeight: 600, fontSize: 14,
                  fontFamily: 'Manrope, sans-serif', cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Hotel Card Component ─────────────────────────────────────────────────────
function HotelCard({ hotel, idx, onEdit, onDelete, t, isDark }) {
  return (
    <div className="hl-card" style={{
      borderRadius: 20, overflow: 'hidden',
      background: isDark ? 'rgba(31,31,31,0.6)' : 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(16px)',
      border: `1px solid ${t.border}`,
      boxShadow: isDark ? '0 8px 28px rgba(0,0,0,0.35)' : '0 8px 28px rgba(28,28,17,0.07)',
    }}>
      <div style={{ padding: '20px 22px' }}>
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: t.primary, margin: '0 0 6px' }}>
              Stage {String(idx + 1).padStart(2, '0')}
            </p>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: t.textPrimary, margin: 0, letterSpacing: '-0.3px', fontFamily: 'Manrope, sans-serif' }}>
              {hotel.hotel_name}
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => onEdit(hotel)} style={{
              width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.border}`,
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.textMuted, transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = t.primaryFaded; e.currentTarget.style.color = t.primary }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.textMuted }}
            ><EditIcon /></button>
            <button onClick={() => onDelete(hotel.id)} style={{
              width: 30, height: 30, borderRadius: 8,
              border: '1px solid rgba(239,68,68,0.25)',
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ef4444', transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            ><TrashIcon /></button>
          </div>
        </div>

        {/* 3-col stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12, borderTop: `1px solid ${t.border}`, paddingTop: 14,
        }}>
          {[
            { label: 'Cost / Night', value: `₹${hotel.cost_per_night?.toLocaleString('en-IN')}`, color: t.primary },
            { label: 'Nights', value: hotel.nights, color: t.textPrimary },
            { label: 'Total', value: `₹${hotel.total_cost?.toLocaleString('en-IN')}`, color: t.accent },
          ].map(item => (
            <div key={item.label}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 5px' }}>
                {item.label}
              </p>
              <p style={{ fontSize: 16, fontWeight: 800, color: item.color, margin: 0, fontFamily: 'Lora, serif' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}