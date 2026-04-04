import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'

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
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
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
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const FlagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
)
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
)

/* ─── Theme token sets ───────────────────────────────────────────────── */
const THEME = {
  dark: {
    pageBg: '#0a0a0a',
    dotGrid: 'rgba(0,225,171,0.10)',
    navBg: 'rgba(10,10,10,0.80)',
    navBorder: 'rgba(0,225,171,0.08)',
    brandAccent: '#00e1ab',
    brandText: '#e2e2e2',
    titleColor: '#e2e2e2',
    eyebrowColor: '#00e1ab',
    accent: '#00e1ab',
    accentText: '#003828',
    accentGlow: 'rgba(0,225,171,0.35)',
    accentGlowHover: 'rgba(0,225,171,0.55)',
    pathLine: '#00e1ab',
    monthText: 'rgba(226,226,226,0.30)',
    monthBg: '#0a0a0a',
    monthBorder: 'rgba(0,225,171,0.12)',
    cardBg: '#141414',
    cardBorder: 'rgba(0,225,171,0.08)',
    cardBorderHover: 'rgba(0,225,171,0.22)',
    cardShadowHover: '0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,225,171,0.08)',
    levelBg: 'rgba(0,225,171,0.08)',
    levelColor: '#00e1ab',
    levelBorder: 'rgba(0,225,171,0.15)',
    tripName: '#e2e2e2',
    metaColor: '#666666',
    nodeDotActive: '#00e1ab',
    nodeDotInactive: '#1a1a1a',
    nodeDotBorder: '#2d2d2d',
    nodeDotIconColor: '#555555',
    nodeActiveFg: '#003828',
    nodeGlow: 'rgba(0,225,171,0.15)',
    editBtnBg: 'rgba(255,255,255,0.04)',
    editBtnColor: '#888888',
    editBtnHoverBg: 'rgba(255,255,255,0.10)',
    editBtnHoverColor: '#e2e2e2',
    modalBg: '#111111',
    modalBorder: 'rgba(0,225,171,0.12)',
    modalTitleColor: '#e2e2e2',
    closeBtnBg: 'rgba(255,255,255,0.05)',
    closeBtnBorder: 'rgba(255,255,255,0.08)',
    closeBtnColor: '#666666',
    inputBg: '#1a1a1a',
    inputBorder: 'rgba(255,255,255,0.08)',
    inputColor: '#e2e2e2',
    inputFocusBorder: 'rgba(0,225,171,0.4)',
    inputFocusShadow: 'rgba(0,225,171,0.08)',
    labelColor: 'rgba(226,226,226,0.40)',
    cancelBg: 'rgba(255,255,255,0.04)',
    cancelBorder: 'rgba(255,255,255,0.08)',
    cancelColor: '#888888',
    cancelHoverBg: 'rgba(255,255,255,0.08)',
    cancelHoverColor: '#e2e2e2',
    spinnerRing: 'rgba(0,225,171,0.15)',
    emptyTitle: '#e2e2e2',
    emptyDesc: '#555555',
    backdropBg: 'rgba(0,0,0,0.75)',
  },
  light: {
    pageBg: '#fdfae7',
    dotGrid: 'rgba(0,75,135,0.07)',
    navBg: 'rgba(253,250,231,0.85)',
    navBorder: 'rgba(0,52,97,0.08)',
    brandAccent: '#004B87',
    brandText: '#1c1c11',
    titleColor: '#003461',
    eyebrowColor: '#1b6d24',
    accent: '#004B87',
    accentText: '#ffffff',
    accentGlow: 'rgba(0,75,135,0.20)',
    accentGlowHover: 'rgba(0,75,135,0.35)',
    pathLine: '#004B87',
    monthText: 'rgba(28,28,17,0.30)',
    monthBg: '#fdfae7',
    monthBorder: 'rgba(0,75,135,0.12)',
    cardBg: '#ffffff',
    cardBorder: 'rgba(0,52,97,0.08)',
    cardBorderHover: 'rgba(0,75,135,0.20)',
    cardShadowHover: '0 12px 40px rgba(0,0,0,0.10), 0 0 20px rgba(0,75,135,0.06)',
    levelBg: 'rgba(0,75,135,0.07)',
    levelColor: '#004B87',
    levelBorder: 'rgba(0,75,135,0.15)',
    tripName: '#1c1c11',
    metaColor: '#6b7280',
    nodeDotActive: '#004B87',
    nodeDotInactive: '#e6e3d0',
    nodeDotBorder: '#c2c6d1',
    nodeDotIconColor: '#9ca3af',
    nodeActiveFg: '#ffffff',
    nodeGlow: 'rgba(0,75,135,0.15)',
    editBtnBg: 'rgba(0,0,0,0.03)',
    editBtnColor: '#6b7280',
    editBtnHoverBg: 'rgba(0,0,0,0.08)',
    editBtnHoverColor: '#1c1c11',
    modalBg: '#ffffff',
    modalBorder: 'rgba(0,52,97,0.10)',
    modalTitleColor: '#003461',
    closeBtnBg: 'rgba(0,0,0,0.04)',
    closeBtnBorder: 'rgba(0,0,0,0.08)',
    closeBtnColor: '#6b7280',
    inputBg: '#f7f4e1',
    inputBorder: 'rgba(0,0,0,0.10)',
    inputColor: '#1c1c11',
    inputFocusBorder: 'rgba(0,75,135,0.45)',
    inputFocusShadow: 'rgba(0,75,135,0.08)',
    labelColor: 'rgba(28,28,17,0.45)',
    cancelBg: 'rgba(0,0,0,0.04)',
    cancelBorder: 'rgba(0,0,0,0.08)',
    cancelColor: '#6b7280',
    cancelHoverBg: 'rgba(0,0,0,0.08)',
    cancelHoverColor: '#1c1c11',
    spinnerRing: 'rgba(0,75,135,0.15)',
    emptyTitle: '#003461',
    emptyDesc: '#6b7280',
    backdropBg: 'rgba(0,0,0,0.45)',
  },
}

/* ─── Travel badge colours (readable on both themes) ─────────────────── */
const TRAVEL_COLORS = {
  Solo: { accent: '#00b894', icon: '🧭' },
  Family: { accent: '#6c9ef8', icon: '🏡' },
  Friends: { accent: '#f97316', icon: '🎉' },
}

const defaultForm = {
  trip_name: '', destination: '', start_date: '',
  end_date: '', budget: '', travel_type: 'Solo',
}

/* ─── Font injection (once) ──────────────────────────────────────────── */
let fontsInjected = false
function injectFonts() {
  if (fontsInjected) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800;900&family=Syne:wght@400;700;800&display=swap'
  document.head.appendChild(link)
  fontsInjected = true
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
const getDuration = (start, end) => {
  const d = Math.ceil((new Date(end) - new Date(start)) / 86400000)
  return d > 0 ? `${d}d` : null
}
const fmtDate = (iso, opts) => new Date(iso).toLocaleDateString('en-IN', opts)
const fmtMonth = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()

const groupByMonth = (trips) => {
  const map = {}
  trips.forEach((t, i) => {
    const key = fmtMonth(t.start_date)
    if (!map[key]) map[key] = []
    map[key].push({ ...t, _idx: i })
  })
  return Object.entries(map)
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function NewTripBtn({ tk, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: tk.accent, color: tk.accentText,
        padding: '12px 26px', borderRadius: 999,
        fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 800,
        letterSpacing: '0.04em', border: 'none', cursor: 'pointer',
        boxShadow: `0 0 24px ${tk.accentGlow}`,
        transition: 'transform 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.04)'
        e.currentTarget.style.boxShadow = `0 0 36px ${tk.accentGlowHover}`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = `0 0 24px ${tk.accentGlow}`
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
    >
      <PlusIcon /> New Quest
    </button>
  )
}

function IconBtn({ onClick, title, bg, color, hoverBg, hoverColor, border, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bg, color, border: border || 'none',
        cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = hoverBg
        e.currentTarget.style.color = hoverColor
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = bg
        e.currentTarget.style.color = color
      }}
    >
      {children}
    </button>
  )
}

function MetaRow({ icon, color, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color }}>
      {icon}{children}
    </div>
  )
}

function Field({ label, tk, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 9, fontWeight: 800, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: tk.labelColor,
      }}>{label}</label>
      {children}
    </div>
  )
}

function TlInput({ tk, ...props }) {
  const base = {
    background: tk.inputBg,
    border: `1px solid ${tk.inputBorder}`,
    borderRadius: 12, padding: '12px 16px',
    color: tk.inputColor,
    fontFamily: "'Manrope', sans-serif", fontSize: 13,
    outline: 'none', width: '100%',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }
  return (
    <input
      style={base}
      onFocus={e => {
        e.target.style.borderColor = tk.inputFocusBorder
        e.target.style.boxShadow = `0 0 0 3px ${tk.inputFocusShadow}`
      }}
      onBlur={e => {
        e.target.style.borderColor = tk.inputBorder
        e.target.style.boxShadow = 'none'
      }}
      {...props}
    />
  )
}

/* ─── TripCard ───────────────────────────────────────────────────────── */
function TripCard({ trip, index, onEdit, onDelete, tk }) {
  const { accent, icon } = TRAVEL_COLORS[trip.travel_type] || TRAVEL_COLORS.Solo
  const duration = getDuration(trip.start_date, trip.end_date)

  return (
    <div
      style={{
        background: tk.cardBg,
        border: `1px solid ${tk.cardBorder}`,
        borderRadius: 18, padding: '22px 24px',
        maxWidth: 340, width: '100%',
        position: 'relative', overflow: 'hidden',
        transition: 'transform 0.22s, border-color 0.22s, box-shadow 0.22s',
        fontFamily: "'Manrope', sans-serif",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = tk.cardBorderHover
        e.currentTarget.style.boxShadow = tk.cardShadowHover
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = tk.cardBorder
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        borderRadius: '18px 18px 0 0',
        background: `linear-gradient(90deg, ${accent}, ${accent}55)`,
      }} />

      {/* level + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase',
          padding: '3px 10px', borderRadius: 999,
          background: tk.levelBg, color: tk.levelColor, border: `1px solid ${tk.levelBorder}`,
        }}>
          LV. {String(index + 1).padStart(2, '0')}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <IconBtn
            onClick={() => onEdit(trip)} title="Edit"
            bg={tk.editBtnBg} color={tk.editBtnColor}
            hoverBg={tk.editBtnHoverBg} hoverColor={tk.editBtnHoverColor}
          ><EditIcon /></IconBtn>
          <IconBtn
            onClick={() => onDelete(trip.id)} title="Delete"
            bg="rgba(239,68,68,0.06)" color="rgba(239,68,68,0.6)"
            hoverBg="rgba(239,68,68,0.15)" hoverColor="#ef4444"
            border="1px solid rgba(239,68,68,0.15)"
          ><TrashIcon /></IconBtn>
        </div>
      </div>

      {/* trip name */}
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800,
        color: tk.tripName, letterSpacing: '-0.02em', marginBottom: 4,
      }}>{trip.trip_name}</div>

      {/* travel type badge */}
      <div style={{
        display: 'inline-block', fontSize: 9, fontWeight: 800,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        padding: '3px 9px', borderRadius: 999, marginBottom: 14,
        background: `${accent}18`, color: accent, border: `1px solid ${accent}30`,
      }}>
        {icon} {trip.travel_type.toUpperCase()}
      </div>

      {/* meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <MetaRow icon={<PinIcon />} color={tk.metaColor}>{trip.destination}</MetaRow>
        <MetaRow icon={<CalIcon />} color={tk.metaColor}>
          {fmtDate(trip.start_date, { month: 'short', day: 'numeric' })} –{' '}
          {fmtDate(trip.end_date, { month: 'short', day: 'numeric' })}
          {duration && (
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 999, marginLeft: 6,
              background: `${accent}18`, color: accent,
            }}>{duration}</span>
          )}
        </MetaRow>
        <MetaRow icon={<WalletIcon />} color={tk.metaColor}>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, color: accent,
          }}>₹{trip.budget?.toLocaleString('en-IN')}</span>
        </MetaRow>
      </div>
    </div>
  )
}

/* ─── Modal ──────────────────────────────────────────────────────────── */
function TripModal({ title, onClose, tk, children }) {
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
        background: tk.backdropBg, backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        animation: 'tl-fade-in 0.18s ease',
      }}
    >
      <div style={{
        background: tk.modalBg,
        border: `1px solid ${tk.modalBorder}`,
        borderRadius: 24, padding: 32,
        width: '100%', maxWidth: 520,
        boxShadow: '0 40px 80px rgba(0,0,0,0.25)',
        animation: 'tl-slide-up 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: "'Manrope', sans-serif",
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800,
            letterSpacing: '-0.03em', color: tk.modalTitleColor,
          }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: tk.closeBtnBg, border: `1px solid ${tk.closeBtnBorder}`,
              color: tk.closeBtnColor, cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = tk.editBtnHoverBg
              e.currentTarget.style.color = tk.tripName
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = tk.closeBtnBg
              e.currentTarget.style.color = tk.closeBtnColor
            }}
          ><CloseIcon /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function TripLogger() {
  injectFonts()

  // Support the most common ThemeContext shapes:
  // { isDark }, { mode: 'dark'|'light' }, { theme: 'dark'|'light' }
  // Falls back to light if none match.
  const themeCtx = useTheme()
  const isDark =
    themeCtx?.isDark ??
    (themeCtx?.mode === 'dark') ??
    (themeCtx?.theme === 'dark') ??
    false

  const tk = isDark ? THEME.dark : THEME.light

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

  const grouped = groupByMonth(trips)

  return (
    <div style={{
      fontFamily: "'Manrope', sans-serif",
      background: tk.pageBg,
      color: tk.tripName,
      minHeight: '100vh',
      transition: 'background 0.3s, color 0.3s',
    }}>
      {/* Keyframe animations */}
      <style>{`
        @keyframes tl-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes tl-slide-up { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes tl-ping     { 0% { transform: scale(1); opacity: 0.5 } 100% { transform: scale(1.75); opacity: 0 } }
        @keyframes tl-spin     { to { transform: rotate(360deg) } }
      `}</style>

      {/* dot-grid background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(${tk.dotGrid} 1px, transparent 1px)`,
        backgroundSize: '38px 38px',
      }} />

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 68,
        background: tk.navBg, backdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${tk.navBorder}`,
      }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800,
          letterSpacing: '-0.03em', color: tk.brandAccent,
        }}>
          Journey<span style={{ color: tk.brandText }}>Log</span>
        </div>
        <NewTripBtn tk={tk} onClick={openNew} />
      </nav>

      {/* ── Page body ───────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1, paddingBottom: 80 }}>

        {/* Header */}
        <header style={{ maxWidth: 900, margin: '48px auto 40px', padding: '0 24px' }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.25em',
            textTransform: 'uppercase', color: tk.eyebrowColor, marginBottom: 10,
          }}>Adventure Log</p>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(36px, 6vw, 62px)',
            fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em',
            color: tk.titleColor,
          }}>
            Your Journey{' '}
            <em style={{ color: tk.accent, fontStyle: 'italic' }}>Atlas.</em>
          </h1>
        </header>

        {/* ── States ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `2px solid ${tk.spinnerRing}`,
              borderTopColor: tk.accent,
              animation: 'tl-spin 0.8s linear infinite',
            }} />
          </div>

        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✈️</div>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800,
              color: tk.emptyTitle, marginBottom: 8,
            }}>No quests yet</div>
            <div style={{ color: tk.emptyDesc, fontSize: 14, marginBottom: 24 }}>
              Begin your travel chronicle
            </div>
            <NewTripBtn tk={tk} onClick={openNew} />
          </div>

        ) : (
          /* ── Timeline ── */
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', position: 'relative' }}>

            {/* dashed centre path */}
            <div style={{
              position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1,
              transform: 'translateX(-50%)',
              background: `repeating-linear-gradient(
                to bottom, ${tk.pathLine} 0, ${tk.pathLine} 10px,
                transparent 10px, transparent 22px
              )`,
              opacity: 0.15,
            }} />

            {grouped.map(([month, monthTrips]) => (
              <div key={month}>

                {/* Month divider */}
                <div style={{
                  textAlign: 'center', position: 'relative', zIndex: 2,
                  margin: '40px 0 32px',
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.4em',
                  textTransform: 'uppercase', color: tk.monthText,
                }}>
                  <span style={{
                    display: 'inline-block',
                    background: tk.monthBg, padding: '4px 18px', borderRadius: 999,
                    border: `1px solid ${tk.monthBorder}`,
                  }}>{month}</span>
                </div>

                {/* Trip rows */}
                {monthTrips.map((trip, i) => {
                  const isActive = i === 0
                  const goRight = i % 2 !== 0
                  return (
                    <div
                      key={trip.id}
                      style={{
                        position: 'relative', zIndex: 2,
                        display: 'flex', alignItems: 'center', gap: 24,
                        justifyContent: goRight ? 'flex-end' : 'flex-start',
                        flexDirection: goRight ? 'row-reverse' : 'row',
                        marginBottom: 40,
                      }}
                    >
                      <TripCard
                        trip={trip}
                        index={trip._idx}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        tk={tk}
                      />

                      {/* Node dot */}
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                        background: isActive ? tk.nodeDotActive : tk.nodeDotInactive,
                        border: isActive ? 'none' : `2px solid ${tk.nodeDotBorder}`,
                        color: isActive ? tk.nodeActiveFg : tk.nodeDotIconColor,
                        boxShadow: isActive
                          ? `0 0 0 6px ${tk.nodeGlow}, 0 0 24px ${tk.nodeGlow}`
                          : 'none',
                      }}>
                        {isActive && (
                          <div style={{
                            position: 'absolute', inset: 0, borderRadius: '50%',
                            border: `2px solid ${tk.nodeDotActive}`,
                            animation: 'tl-ping 2s cubic-bezier(0,0,0.2,1) infinite',
                          }} />
                        )}
                        {isActive ? <FlagIcon /> : <CheckIcon />}
                      </div>

                      {/* Spacer keeps card pressed to its edge */}
                      <div style={{ flex: 1, maxWidth: 340 }} />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ───────────────────────────────────────────── */}
      {showForm && (
        <TripModal
          title={editing ? 'Edit Quest' : 'New Quest'}
          onClose={closeForm}
          tk={tk}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <Field label="Trip Name" tk={tk}>
              <TlInput tk={tk} placeholder="e.g. Monsoon Retreat" required {...f('trip_name')} />
            </Field>

            <Field label="Destination" tk={tk}>
              <TlInput tk={tk} placeholder="e.g. Manali, HP" required {...f('destination')} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Start Date" tk={tk}>
                <TlInput tk={tk} type="date" required {...f('start_date')} />
              </Field>
              <Field label="End Date" tk={tk}>
                <TlInput tk={tk} type="date" required min={form.start_date} {...f('end_date')} />
              </Field>
            </div>

            <Field label="Budget (₹)" tk={tk}>
              <TlInput tk={tk} type="number" min="0" step="0.01" placeholder="e.g. 45000" required {...f('budget')} />
            </Field>

            <Field label="Travel Type" tk={tk}>
              <select
                required
                style={{
                  background: tk.inputBg, border: `1px solid ${tk.inputBorder}`,
                  borderRadius: 12, padding: '12px 16px',
                  color: tk.inputColor,
                  fontFamily: "'Manrope', sans-serif", fontSize: 13,
                  outline: 'none', width: '100%', cursor: 'pointer', appearance: 'none',
                }}
                {...f('travel_type')}
              >
                {['Solo', 'Family', 'Friends'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button
                type="submit"
                style={{
                  flex: 1, padding: 13,
                  background: tk.accent, color: tk.accentText,
                  border: 'none', borderRadius: 12, cursor: 'pointer',
                  fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 800,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  boxShadow: `0 0 20px ${tk.accentGlow}`,
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = `0 0 32px ${tk.accentGlowHover}`
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = `0 0 20px ${tk.accentGlow}`
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {editing ? 'Update Quest' : 'Initialize Log'}
              </button>

              <button
                type="button"
                onClick={closeForm}
                style={{
                  flex: 1, padding: 13,
                  background: tk.cancelBg, border: `1px solid ${tk.cancelBorder}`,
                  color: tk.cancelColor, borderRadius: 12, cursor: 'pointer',
                  fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 600,
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = tk.cancelHoverBg
                  e.currentTarget.style.color = tk.cancelHoverColor
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = tk.cancelBg
                  e.currentTarget.style.color = tk.cancelColor
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </TripModal>
      )}
    </div>
  )
}