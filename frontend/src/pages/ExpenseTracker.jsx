import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { Spinner, EmptyState } from '../design/UI'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

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
    primaryContainer: '#004b87',
    accent: '#1b6d24',
    accentFaded: '#1b6d2418',
    tertiary: '#611a07',
    progressBg: '#e6e3d0',
    // stat card first is gradient, rest are flat
    s1grad: 'linear-gradient(135deg,#003461,#004b87)',
    sFlat: '#e6e3d0',
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
    primaryContainer: '#0d1f35',
    accent: '#4ae183',
    accentFaded: '#4ae18314',
    tertiary: '#ffb4a1',
    progressBg: '#1e2f4a',
    s1grad: 'linear-gradient(135deg,#3b82f6,#6366f1)',
    sFlat: '#2a2a2a',
  },
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CAT_COLORS = {
  Transport: '#3b82f6',
  Food: '#ef4444',
  Stay: '#10b981',
  Activities: '#f59e0b',
  Shopping: '#8b5cf6',
  Other: '#6b7280',
}
const CAT_ICONS = {
  Transport: '🚌',
  Food: '🍽️',
  Stay: '🏨',
  Activities: '🎯',
  Shopping: '🛍️',
  Other: '📦',
}
const CATEGORIES = ['Transport', 'Food', 'Stay', 'Activities', 'Shopping', 'Other']
const defaultForm = { trip_id: '', category: 'Transport', amount: '', description: '' }

// ─── Icons ────────────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function ExpenseTracker() {
  const { dark: ctxDark } = useTheme()
  const [isDark, setIsDark] = useState(ctxDark ?? false)
  useEffect(() => { if (ctxDark !== undefined) setIsDark(ctxDark) }, [ctxDark])
  const t = themes[isDark ? 'dark' : 'light']

  const [expenses, setExpenses] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [tripDropOpen, setTripDropOpen] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!tripDropOpen) return
    const handler = (e) => {
      if (!e.target.closest('[data-trip-dropdown]')) setTripDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [tripDropOpen])

  useEffect(() => {
    api.get('/api/trips').then(r => {
      setTrips(r.data.trips)
      if (r.data.trips.length > 0) setSelectedTrip(r.data.trips[0].id)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedTrip) { fetchExpenses(); fetchSummary() }
  }, [selectedTrip])

  const fetchExpenses = async () => {
    setLoading(true)
    try { const r = await api.get(`/api/expenses/${selectedTrip}`); setExpenses(r.data.expenses) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }
  const fetchSummary = async () => {
    try { const r = await api.get(`/api/expenses/${selectedTrip}/summary`); setSummary(r.data) }
    catch (e) { console.error(e) }
  }

  const openNew = () => { setForm({ ...defaultForm, trip_id: selectedTrip }); setEditing(null); setShowForm(true) }
  const openEdit = (exp) => {
    setEditing(exp)
    setForm({ trip_id: exp.trip_id, category: exp.category, amount: exp.amount.toString(), description: exp.description || '' })
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const amount = parseFloat(form.amount)
      if (isNaN(amount) || amount <= 0) { alert('Please enter a valid amount.'); return }
      const data = { trip_id: parseInt(form.trip_id), category: form.category, amount, description: form.description }
      if (editing) await api.put(`/api/expenses/${editing.id}`, data)
      else await api.post('/api/expenses', data)
      fetchExpenses(); fetchSummary(); closeForm()
    } catch (err) { console.error(err); alert('Error saving expense.') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try { await api.delete(`/api/expenses/${id}`); fetchExpenses(); fetchSummary() }
    catch (e) { console.error(e) }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) })

  const selectedTripObj = trips.find(tr => String(tr.id) === String(selectedTrip))

  const pieData = summary?.category_breakdown
    ? Object.entries(summary.category_breakdown).map(([name, value]) => ({
      name, value: parseFloat(value), color: CAT_COLORS[name] || '#6b7280',
    }))
    : []

  const topCats = pieData.sort((a, b) => b.value - a.value).slice(0, 3)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Lora:ital,wght@0,700;1,700&display=swap');
        * { box-sizing: border-box; }
        @keyframes et-fade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes et-spin  { to{transform:rotate(360deg)} }
        .et-hover { transition: transform 0.2s, box-shadow 0.2s; }
        .et-hover:hover { transform: scale(1.02); }
        .et-row { transition: transform 0.2s, box-shadow 0.2s; }
        .et-row:hover { transform: scale(1.005); }
        .et-btn { transition: opacity 0.18s, transform 0.18s; cursor: pointer; }
        .et-btn:hover { opacity: 0.85; transform: scale(1.02); }
        .et-icon-btn { transition: background 0.15s, color 0.15s; }
        .et-edit:hover { background: ${themes.light.primaryFaded} !important; }
        .et-del:hover  { background: rgba(239,68,68,0.1) !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Manrope, sans-serif', transition: 'background 0.3s' }}>

        {/* dot-grid background */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `radial-gradient(${isDark ? 'rgba(163,201,255,0.07)' : 'rgba(0,52,97,0.06)'} 1px, transparent 1px)`,
          backgroundSize: '38px 38px',
        }} />
        {/* ambient blobs */}
        <div style={{ position: 'fixed', bottom: -80, right: -80, width: 340, height: 340, borderRadius: '50%', background: isDark ? 'rgba(163,201,255,0.04)' : 'rgba(0,52,97,0.04)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', top: 80, right: 160, width: 220, height: 220, borderRadius: '50%', background: isDark ? 'rgba(74,225,131,0.03)' : 'rgba(27,109,36,0.03)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1080, margin: '0 auto', padding: '48px 24px 100px' }}>

          {/* ── Page Header ── */}
          <header style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end',
            gap: 16, marginBottom: 36, animation: 'et-fade 0.45s ease both',
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: t.accent, margin: '0 0 10px' }}>
                Trip Ledger
              </p>
              <h1 style={{
                fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, letterSpacing: '-2px',
                color: t.primary, lineHeight: 1, margin: 0, fontFamily: 'Manrope, sans-serif',
              }}>Expense Tracker</h1>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Trip selector dropdown */}
              <div data-trip-dropdown style={{ position: 'relative', zIndex: 10 }}>
                <button
                  onClick={() => setTripDropOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px', borderRadius: 12,
                    background: isDark ? t.cardHigh : t.cardHigh,
                    border: `1px solid ${t.border}`,
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
                    border: `1px solid ${t.border}`,
                    borderRadius: 14, minWidth: 260,
                    boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.7)' : '0 24px 60px rgba(28,28,17,0.18)',
                    overflow: 'hidden',
                  }}>
                    {trips.map(tr => (
                      <button key={tr.id} onClick={() => { setSelectedTrip(tr.id); setTripDropOpen(false) }} style={{
                        width: '100%', textAlign: 'left', padding: '13px 18px',
                        background: String(tr.id) === String(selectedTrip) ? t.primaryFaded : 'transparent',
                        border: 'none', borderBottom: `1px solid ${t.border}`, cursor: 'pointer',
                        fontSize: 13, fontWeight: 600, color: String(tr.id) === String(selectedTrip) ? t.primary : t.textSecond,
                        fontFamily: 'Manrope, sans-serif',
                        transition: 'background 0.15s',
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

              {/* Add Expense button */}
              <button
                className="et-btn"
                onClick={openNew}
                disabled={!selectedTrip}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 22px', borderRadius: 12, border: 'none',
                  background: selectedTrip ? t.primary : t.progressBg,
                  color: isDark ? '#001e3c' : '#fff',
                  fontSize: 13, fontWeight: 700, fontFamily: 'Manrope, sans-serif',
                  boxShadow: selectedTrip ? `0 4px 16px ${t.primaryFaded}` : 'none',
                }}
              >
                <PlusIcon /> Add Expense
              </button>
            </div>
          </header>

          {selectedTrip && summary && (
            <>
              {/* ── Stat Cards — bento style from HTML ── */}
              <section style={{
                display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                gap: 16, marginBottom: 28,
                animation: 'et-fade 0.45s 0.08s ease both',
              }}>
                {/* Total — gradient */}
                <div className="et-hover" style={{
                  borderRadius: 16, padding: '24px',
                  background: t.s1grad,
                  boxShadow: isDark ? '0 8px 28px rgba(0,0,0,0.4)' : '0 8px 28px rgba(0,52,97,0.15)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', bottom: -12, right: -12, fontSize: 72, opacity: 0.08, lineHeight: 1 }}>💸</div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>
                      Total Expenses
                    </p>
                    <h3 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-1px', fontFamily: 'Lora, serif' }}>
                      ₹{summary.total_expenses?.toLocaleString('en-IN')}
                    </h3>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                      {summary.expense_count} entries
                    </p>
                  </div>
                </div>

                {/* Top 3 categories — flat */}
                {topCats.map((cat, i) => (
                  <div key={cat.name} className="et-hover" style={{
                    borderRadius: 16, padding: '24px',
                    background: isDark ? t.cardLow : t.cardLow,
                    border: `1px solid ${t.border}`,
                    boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(28,28,17,0.06)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, margin: 0 }}>
                        {cat.name}
                      </p>
                      <span style={{ fontSize: 18, color: cat.color }}>{CAT_ICONS[cat.name] || '📦'}</span>
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: t.textPrimary, margin: '0 0 10px', letterSpacing: '-0.5px', fontFamily: 'Lora, serif' }}>
                      ₹{cat.value.toLocaleString('en-IN')}
                    </h3>
                    <div style={{ height: 4, borderRadius: 2, background: t.progressBg, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${Math.round((cat.value / summary.total_expenses) * 100)}%`,
                        background: cat.color, transition: 'width 0.7s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </section>

              {/* ── Bento: Distribution (5col) + Expense List (7col) ── */}
              <section style={{
                display: 'grid', gridTemplateColumns: '5fr 7fr',
                gap: 20, marginBottom: 28,
                animation: 'et-fade 0.45s 0.16s ease both',
              }}>

                {/* Distribution panel */}
                {pieData.length > 0 && (
                  <div style={{
                    borderRadius: 20, padding: '28px',
                    background: isDark ? t.card : t.cardLow,
                    border: `1px solid ${t.border}`,
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(28,28,17,0.06)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: t.textMuted, margin: 0 }}>
                        Distribution
                      </p>
                      <span style={{ fontSize: 10, fontWeight: 700, color: t.primary, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        Category Breakdown
                      </span>
                    </div>

                    {/* Donut chart */}
                    <div style={{ position: 'relative', marginBottom: 24 }}>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={4} dataKey="value">
                            {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)',
                        textAlign: 'center', pointerEvents: 'none',
                      }}>
                        <p style={{ fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 4px' }}>Spent</p>
                        <p style={{ fontSize: 22, fontWeight: 900, color: t.textPrimary, margin: 0, fontFamily: 'Lora, serif' }}>
                          {Math.round((summary.total_expenses / (summary.total_budget || summary.total_expenses)) * 100)}%
                        </p>
                      </div>
                    </div>

                    {/* Breakdown bars */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {pieData.map(item => {
                        const pct = Math.round((item.value / summary.total_expenses) * 100)
                        return (
                          <div key={item.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: t.textPrimary }}>
                                {item.name}
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: item.color }}>
                                {pct}% · ₹{item.value.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, background: t.progressBg, overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: item.color, transition: 'width 0.7s ease' }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Expense list */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: t.textMuted, margin: 0 }}>
                      Recent Transactions
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
                        padding: '3px 10px', borderRadius: 999,
                        background: t.primaryFaded, color: t.primary,
                        cursor: 'pointer',
                      }}>Recent</span>
                      <span style={{
                        fontSize: 9, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
                        padding: '3px 10px', borderRadius: 999, color: t.textMuted, cursor: 'pointer',
                      }}>Amount</span>
                    </div>
                  </div>

                  {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${t.border}`, borderTopColor: t.primary, animation: 'et-spin 0.8s linear infinite' }} />
                    </div>
                  ) : expenses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', borderRadius: 16, border: `2px dashed ${t.border}` }}>
                      <p style={{ fontSize: 32, marginBottom: 10 }}>💸</p>
                      <p style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary, margin: '0 0 6px' }}>No expenses yet</p>
                      <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>Start tracking your trip spending</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {expenses.map(exp => {
                        const catColor = CAT_COLORS[exp.category] || '#6b7280'
                        return (
                          <div key={exp.id} className="et-row" style={{
                            borderRadius: 16, padding: '18px 20px',
                            background: isDark
                              ? 'rgba(31,31,31,0.6)'
                              : 'rgba(255,255,255,0.7)',
                            backdropFilter: 'blur(12px)',
                            border: `1px solid ${t.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(28,28,17,0.05)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              {/* icon */}
                              <div style={{
                                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                                background: `${catColor}15`,
                                border: `1px solid ${catColor}25`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 24,
                              }}>
                                {CAT_ICONS[exp.category] || '📦'}
                              </div>
                              <div>
                                <h5 style={{ fontSize: 14, fontWeight: 800, color: t.textPrimary, margin: '0 0 6px', fontFamily: 'Manrope, sans-serif' }}>
                                  {exp.description || exp.category}
                                </h5>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{
                                    fontSize: 9, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
                                    color: catColor, background: `${catColor}12`,
                                    padding: '2px 8px', borderRadius: 999,
                                  }}>{exp.category}</span>
                                  <span style={{ fontSize: 10, color: t.textMuted }}>
                                    {new Date(exp.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <span style={{ fontSize: 20, fontWeight: 900, color: t.textPrimary, fontFamily: 'Lora, serif', letterSpacing: '-0.5px' }}>
                                ₹{exp.amount?.toLocaleString('en-IN')}
                              </span>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  className="et-icon-btn et-edit"
                                  onClick={() => openEdit(exp)}
                                  style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    border: `1px solid ${t.border}`, background: 'transparent',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: t.textMuted,
                                  }}
                                ><EditIcon /></button>
                                <button
                                  className="et-icon-btn et-del"
                                  onClick={() => handleDelete(exp.id)}
                                  style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    border: '1px solid rgba(239,68,68,0.25)', background: 'transparent',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#ef4444',
                                  }}
                                ><TrashIcon /></button>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {/* Load more dashed */}
                      <button style={{
                        width: '100%', padding: '16px',
                        border: `2px dashed ${t.border}`,
                        borderRadius: 16, background: 'transparent',
                        fontSize: 9, fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase',
                        color: t.textMuted, cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
                        transition: 'border-color 0.18s, color 0.18s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = t.primary; e.currentTarget.style.color = t.primary }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted }}
                      >
                        View Complete Transaction Ledger
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {!selectedTrip && (
            <div style={{ textAlign: 'center', padding: '80px 20px', animation: 'et-fade 0.45s ease both' }}>
              <p style={{ fontSize: 48, marginBottom: 14 }}>🧾</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: t.textPrimary, margin: '0 0 8px' }}>Select a trip</p>
              <p style={{ fontSize: 14, color: t.textMuted }}>Choose a trip above to view and add expenses</p>
            </div>
          )}
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
                {editing ? 'Edit Expense' : 'Add Expense'}
              </h2>
              <button onClick={closeForm} style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.border}`,
                background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textMuted,
              }}><CloseIcon /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Trip */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Trip</label>
                <select {...f('trip_id')} required style={{ width: '100%', background: isDark ? t.cardHigh : t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', color: t.textPrimary, fontFamily: 'Manrope, sans-serif', fontSize: 13, outline: 'none', appearance: 'none' }}>
                  <option value="">Select a trip…</option>
                  {trips.map(tr => <option key={tr.id} value={tr.id}>{tr.trip_name} — {tr.destination}</option>)}
                </select>
              </div>
              {/* Category */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Category</label>
                <select {...f('category')} required style={{ width: '100%', background: isDark ? t.cardHigh : t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', color: t.textPrimary, fontFamily: 'Manrope, sans-serif', fontSize: 13, outline: 'none', appearance: 'none' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
              </div>
              {/* Amount */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Amount (₹)</label>
                <input {...f('amount')} type="number" min="0" step="0.01" placeholder="500" required style={{ width: '100%', background: isDark ? t.cardHigh : t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', color: t.textPrimary, fontFamily: 'Manrope, sans-serif', fontSize: 13, outline: 'none' }} />
              </div>
              {/* Description */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 6 }}>Description</label>
                <textarea {...f('description')} placeholder="Flight tickets to Goa…" rows={2} style={{ width: '100%', background: isDark ? t.cardHigh : t.surface, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', color: t.textPrimary, fontFamily: 'Manrope, sans-serif', fontSize: 13, outline: 'none', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" className="et-btn" style={{
                  flex: 1, padding: 13, borderRadius: 12, border: 'none',
                  background: t.primary, color: isDark ? '#001e3c' : '#fff',
                  fontWeight: 700, fontSize: 14, fontFamily: 'Manrope, sans-serif',
                }}>{editing ? 'Update' : 'Add'} Expense</button>
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