import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { Spinner } from '../design/UI'

/* ─── Icons ─── */
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const StarIcon = ({ filled, color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const HubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><circle cx="12" cy="5" r="2" /><circle cx="19" cy="12" r="2" /><circle cx="12" cy="19" r="2" /><circle cx="5" cy="12" r="2" />
    <line x1="12" y1="7" x2="12" y2="9" /><line x1="17" y1="12" x2="14" y2="12" /><line x1="12" y1="15" x2="12" y2="17" /><line x1="7" y1="12" x2="10" y2="12" />
  </svg>
)

/* ─── Theme tokens — mirrors Dashboard exactly ─── */
const themes = {
  light: {
    bg: '#fdfae7',
    surface: '#f7f4e1',
    card: '#ece9d6',
    border: 'rgba(66,71,80,0.12)',
    textPrimary: '#1c1c11',
    textSecond: '#424750',
    textMuted: '#727781',
    primary: '#003461',
    primaryFaded: '#004b8718',
    accent: '#1b6d24',
    accentFaded: '#1b6d2418',
    starColor: '#003461',
    nodeBorder: 'rgba(0,52,97,0.35)',
    nodeDotBg: '#fdfae7',
    nodeDotActive: '#003461',
    nodeLineGlow: 'rgba(0,52,97,0.12)',
    blobA: 'radial-gradient(circle, rgba(0,52,97,0.04) 0%, transparent 70%)',
    blobB: 'radial-gradient(circle, rgba(27,109,36,0.04) 0%, transparent 70%)',
    addBtnColor: '#fdfae7',
    addBtnShadow: '0 4px 16px rgba(0,52,97,0.25)',
    fabShadow: '0 4px 24px rgba(0,52,97,0.3)',
  },
  dark: {
    bg: '#0a0a0a',
    surface: '#141414',
    card: '#1a1a1a',
    border: 'rgba(255,255,255,0.08)',
    textPrimary: '#f0f0f0',
    textSecond: '#b0b0b0',
    textMuted: '#666666',
    primary: '#00e1ab',
    primaryFaded: '#00e1ab14',
    accent: '#4ae183',
    accentFaded: '#4ae18314',
    starColor: '#00e1ab',
    nodeBorder: 'rgba(0,225,171,0.4)',
    nodeDotBg: '#0a0a0a',
    nodeDotActive: '#00e1ab',
    nodeLineGlow: 'rgba(0,225,171,0.12)',
    blobA: 'radial-gradient(circle, rgba(0,225,171,0.06) 0%, transparent 70%)',
    blobB: 'radial-gradient(circle, rgba(173,198,255,0.05) 0%, transparent 70%)',
    addBtnColor: '#003828',
    addBtnShadow: '0 0 30px -5px rgba(0,225,171,0.35)',
    fabShadow: '0 0 40px -8px rgba(0,225,171,0.5)',
  }
}

/* ─── Data ─── */
const CAT_COLORS = {
  Beach: '#3b82f6', Fort: '#78716c', Museum: '#8b5cf6', Temple: '#f97316',
  Mountain: '#10b981', Park: '#22c55e', Restaurant: '#ef4444', Shopping: '#ec4899',
  Entertainment: '#a855f7', Historical: '#f59e0b', Other: '#6b7280'
}
const CAT_ICONS = {
  Beach: '🏖️', Fort: '🏰', Museum: '🏛️', Temple: '🛕', Mountain: '⛰️',
  Park: '🌳', Restaurant: '🍽️', Shopping: '🛍️', Entertainment: '🎭', Historical: '🏺', Other: '📍'
}
const CATEGORIES = ['Beach', 'Fort', 'Museum', 'Temple', 'Mountain', 'Park', 'Restaurant', 'Shopping', 'Entertainment', 'Historical', 'Other']
const defaultForm = { trip_id: '', place_name: '', category: 'Beach', rating: '', notes: '' }

/* ─── Star Rating ─── */
const StarRating = ({ value, onChange, color }) => {
  const num = parseFloat(value) || 0
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange({ target: { value: s.toString() } })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          <StarIcon filled={s <= num} color={color} />
        </button>
      ))}
      {num > 0 && <span style={{ fontSize: 12, color, marginLeft: 4, fontWeight: 600 }}>{num}/5</span>}
    </div>
  )
}

/* ─── Main Component ─── */
export default function PlacesLogger({ isDark: isDarkProp }) {
  // ── Mirrors Dashboard's isDark pattern exactly ──
  const { dark } = useTheme()
  const [isDark, setIsDark] = useState(isDarkProp ?? dark ?? true)
  useEffect(() => { if (isDarkProp !== undefined) setIsDark(isDarkProp) }, [isDarkProp])

  const t = themes[isDark ? 'dark' : 'light']

  const [places, setPlaces] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => {
    api.get('/api/trips').then(r => {
      setTrips(r.data.trips)
      if (r.data.trips.length > 0) setSelectedTrip(r.data.trips[0].id)
    }).catch(console.error)
  }, [])

  useEffect(() => { if (selectedTrip) fetchPlaces() }, [selectedTrip])

  const fetchPlaces = async () => {
    setLoading(true)
    try { const r = await api.get(`/api/places/${selectedTrip}`); setPlaces(r.data.places) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const openNew = () => { setForm({ ...defaultForm, trip_id: selectedTrip }); setEditing(null); setShowForm(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ trip_id: p.trip_id, place_name: p.place_name, category: p.category, rating: p.rating || '', notes: p.notes || '' })
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        trip_id: parseInt(form.trip_id),
        place_name: form.place_name.trim(),
        category: form.category,
        rating: form.rating ? parseFloat(form.rating) : null,
        notes: form.notes,
      }
      if (editing) await api.put(`/api/places/${editing.id}`, data)
      else await api.post('/api/places', data)
      fetchPlaces(); closeForm()
    } catch (err) { console.error(err); alert('Error saving place.') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this place?')) return
    try { await api.delete(`/api/places/${id}`); fetchPlaces() }
    catch (e) { console.error(e) }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) })

  // ── Stats ──
  const ratedPlaces = places.filter(p => p.rating)
  const avgRating = ratedPlaces.length > 0
    ? (ratedPlaces.reduce((a, p) => a + p.rating, 0) / ratedPlaces.length).toFixed(1)
    : '—'
  const topCat = places.length > 0
    ? Object.entries(places.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
    : '—'

  // ── Shared input style ──
  const inputStyle = {
    background: t.card,
    border: `1px solid ${t.border}`,
    borderRadius: 12, padding: '12px 14px', color: t.textPrimary, fontSize: 14,
    fontFamily: "'Manrope', sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box',
    transition: 'border-color 0.2s, background 0.3s',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');
        html, body, #root { background: ${t.bg} !important; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        minHeight: '100vh', background: t.bg, color: t.textPrimary,
        fontFamily: "'Manrope', sans-serif", position: 'relative', overflow: 'hidden',
        transition: 'background 0.3s, color 0.3s',
      }}>
        {/* Ambient blobs */}
        <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: t.blobA, pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: t.blobB, pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '48px 32px 80px' }}>

          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20, marginBottom: 48 }}>
            <div>
              <p style={{ fontSize: 11, letterSpacing: '0.25em', color: t.accent, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8, margin: '0 0 8px' }}>Discovery Nodes</p>
              <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, letterSpacing: '-0.03em', color: t.textPrimary, lineHeight: 1, margin: 0 }}>
                Places Logger
              </h1>
              <p style={{ fontSize: 15, color: t.textMuted, marginTop: 10, fontWeight: 400 }}>Track every spot you visit on your travels</p>
            </div>
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: t.primary, color: t.addBtnColor,
                border: 'none', borderRadius: 50, padding: '11px 22px',
                fontWeight: 800, fontSize: 14, cursor: 'pointer',
                fontFamily: "'Manrope', sans-serif",
                boxShadow: t.addBtnShadow,
                transition: 'all 0.2s', letterSpacing: '-0.01em',
                opacity: !selectedTrip ? 0.4 : 1,
              }}
              onClick={openNew}
              disabled={!selectedTrip}
              onMouseEnter={e => { if (selectedTrip) e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <PlusIcon /> Add Place
            </button>
          </div>

          {/* ── Trip Selector ── */}
          <div style={{
            background: t.card, border: `1px solid ${t.border}`,
            borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 40, transition: 'background 0.3s, border-color 0.3s',
          }}>
            <span style={{ fontSize: 20 }}>🗺️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, letterSpacing: '0.18em', color: t.textMuted, textTransform: 'uppercase', margin: '0 0 2px', fontWeight: 600 }}>Active Expedition</p>
              <select
                value={selectedTrip}
                onChange={e => setSelectedTrip(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', color: t.textPrimary,
                  fontSize: 15, fontWeight: 700, fontFamily: "'Manrope', sans-serif",
                  cursor: 'pointer', outline: 'none', width: '100%',
                }}
              >
                <option value="" style={{ background: t.surface }}>— Choose expedition —</option>
                {trips.map(tr => (
                  <option key={tr.id} value={tr.id} style={{ background: t.surface }}>
                    {tr.trip_name} — {tr.destination}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Stats row ── */}
          {selectedTrip && places.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 48 }}>
              {[
                { icon: <HubIcon />, label: 'Total Nodes', value: places.length, iconBg: t.primaryFaded, iconColor: t.primary },
                { icon: <StarIcon filled color={t.primary} />, label: 'Avg Rating', value: avgRating, iconBg: t.primaryFaded, iconColor: t.primary },
                { icon: <span style={{ fontSize: 18 }}>{CAT_ICONS[topCat] || '📍'}</span>, label: 'Top Category', value: topCat, iconBg: t.accentFaded, iconColor: t.accent },
              ].map((s, i) => (
                <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, transition: 'background 0.3s' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: s.iconColor }}>
                    {s.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: '0.18em', color: t.textMuted, textTransform: 'uppercase', margin: '0 0 4px', fontWeight: 600 }}>{s.label}</p>
                    <p style={{ fontSize: typeof s.value === 'string' && s.value.length > 6 ? 15 : 22, fontWeight: 900, color: t.textPrimary, margin: 0 }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Main content ── */}
          {!selectedTrip ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: t.card, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 20 }}>🗺️</div>
              <p style={{ fontSize: 22, fontWeight: 800, color: t.textPrimary, marginBottom: 8 }}>Select an Expedition</p>
              <p style={{ fontSize: 14, color: t.textMuted, maxWidth: 300, lineHeight: 1.6 }}>Choose a trip above to view and log your discovery nodes</p>
            </div>
          ) : loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
          ) : places.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: t.card, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 20 }}>📍</div>
              <p style={{ fontSize: 22, fontWeight: 800, color: t.textPrimary, marginBottom: 8 }}>No Nodes Discovered</p>
              <p style={{ fontSize: 14, color: t.textMuted, maxWidth: 300, lineHeight: 1.6, marginBottom: 24 }}>Start logging memorable spots from this expedition</p>
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.primary, color: t.addBtnColor, border: 'none', borderRadius: 50, padding: '11px 22px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: "'Manrope', sans-serif", boxShadow: t.addBtnShadow }}
                onClick={openNew}
              >
                <PlusIcon /> Log First Place
              </button>
            </div>
          ) : (
            // ── Node path ──
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Vertical connector line */}
              <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, transparent, ${t.nodeLineGlow}, transparent)` }} />

              {places.map((place, idx) => {
                const catColor = CAT_COLORS[place.category] || '#6b7280'
                const icon = CAT_ICONS[place.category] || '📍'
                const isHovered = hoveredCard === place.id
                return (
                  <div
                    key={place.id}
                    style={{ position: 'relative', paddingLeft: 52 }}
                    onMouseEnter={() => setHoveredCard(place.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Node dot */}
                    <div style={{
                      position: 'absolute', left: 0, top: '50%',
                      width: 32, height: 32, borderRadius: '50%',
                      background: t.nodeDotBg,
                      border: `2px solid ${isHovered ? t.nodeDotActive : t.nodeBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                      transform: `translateY(-50%) scale(${isHovered ? 1.2 : 1})`,
                      boxShadow: isHovered ? `0 0 16px ${t.primaryFaded}` : 'none',
                      transition: 'all 0.25s',
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: isHovered ? t.nodeDotActive : t.nodeBorder, transition: 'background 0.25s' }} />
                    </div>

                    {/* Card */}
                    <div style={{
                      background: t.card, border: `1px solid ${isHovered ? `${t.primary}33` : t.border}`,
                      borderRadius: 20, padding: '22px 24px',
                      display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
                      transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                      transition: 'border-color 0.3s, transform 0.25s, background 0.3s',
                    }}>
                      {/* Category icon */}
                      <div style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: `${catColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                        {icon}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 10, letterSpacing: '0.2em', color: t.primary, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 4px' }}>
                          Node {String(idx + 1).padStart(2, '0')}
                        </p>
                        <p style={{ fontSize: 20, fontWeight: 800, color: t.textPrimary, letterSpacing: '-0.02em', margin: '0 0 8px' }}>{place.place_name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                          <span style={{ padding: '3px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: t.primaryFaded, color: t.primary }}>
                            {place.category} {icon}
                          </span>
                          {place.rating && (
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= place.rating} color={t.starColor} />)}
                            </div>
                          )}
                        </div>
                        {place.notes && <p style={{ fontSize: 13, color: t.textSecond, lineHeight: 1.6, margin: 0 }}>{place.notes}</p>}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => openEdit(place)}
                          style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted, transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = t.textPrimary; e.currentTarget.style.borderColor = t.primary }}
                          onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border }}
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(place.id)}
                          style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted, transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.background = 'transparent' }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── FAB ── */}
        {selectedTrip && (
          <button
            style={{
              position: 'fixed', bottom: 28, right: 28, width: 60, height: 60,
              background: t.primary, border: 'none', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: t.fabShadow, color: t.addBtnColor,
              transition: 'all 0.2s', zIndex: 100,
            }}
            onClick={openNew}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <PlusIcon />
          </button>
        )}

        {/* ── Modal ── */}
        {showForm && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
            onClick={e => e.target === e.currentTarget && closeForm()}
          >
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 24, padding: '32px', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 80px rgba(0,0,0,0.3)', fontFamily: "'Manrope', sans-serif", transition: 'background 0.3s' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: t.textPrimary, letterSpacing: '-0.02em', margin: 0 }}>{editing ? 'Edit Node' : 'Log New Place'}</h2>
                <button style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', padding: 4, transition: 'color 0.2s' }}
                  onClick={closeForm}
                  onMouseEnter={e => e.currentTarget.style.color = t.textPrimary}
                  onMouseLeave={e => e.currentTarget.style.color = t.textMuted}>
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Expedition */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Expedition</label>
                  <select {...f('trip_id')} required style={{ ...inputStyle, appearance: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = t.primary}
                    onBlur={e => e.currentTarget.style.borderColor = t.border}>
                    <option value="" style={{ background: t.surface }}>Select a trip…</option>
                    {trips.map(tr => <option key={tr.id} value={tr.id} style={{ background: t.surface }}>{tr.trip_name} — {tr.destination}</option>)}
                  </select>
                </div>

                {/* Place Name */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Place Name</label>
                  <input {...f('place_name')} required placeholder="e.g. Taj Mahal" style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = t.primary}
                    onBlur={e => e.currentTarget.style.borderColor = t.border} />
                </div>

                {/* Category */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Category</label>
                  <select {...f('category')} required style={{ ...inputStyle, appearance: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = t.primary}
                    onBlur={e => e.currentTarget.style.borderColor = t.border}>
                    {CATEGORIES.map(c => <option key={c} value={c} style={{ background: t.surface }}>{CAT_ICONS[c]} {c}</option>)}
                  </select>
                </div>

                {/* Rating */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Rating</label>
                  <StarRating value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} color={t.starColor} />
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Notes</label>
                  <textarea {...f('notes')} rows={3} placeholder="Beautiful architecture with amazing views…"
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                    onFocus={e => e.currentTarget.style.borderColor = t.primary}
                    onBlur={e => e.currentTarget.style.borderColor = t.border} />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit"
                    style={{ flex: 1, background: t.primary, color: t.addBtnColor, border: 'none', borderRadius: 12, padding: '13px', fontWeight: 800, fontSize: 14, fontFamily: "'Manrope', sans-serif", cursor: 'pointer', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    {editing ? 'Update Node' : 'Log Place'}
                  </button>
                  <button type="button" onClick={closeForm}
                    style={{ flex: 1, background: 'transparent', color: t.textMuted, border: `1px solid ${t.border}`, borderRadius: 12, padding: '13px', fontWeight: 700, fontSize: 14, fontFamily: "'Manrope', sans-serif", cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = t.textPrimary; e.currentTarget.style.borderColor = t.textMuted }}
                    onMouseLeave={e => { e.currentTarget.style.color = t.textMuted; e.currentTarget.style.borderColor = t.border }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}