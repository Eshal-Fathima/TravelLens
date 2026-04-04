import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { Spinner, EmptyState } from '../design/UI'
import { useNavigate } from 'react-router-dom'

// ─── Google Fonts (inject once) ───────────────────────────────────────────────
const FONT_LINK = document.getElementById('insights-fonts')
if (!FONT_LINK) {
  const link = document.createElement('link')
  link.id = 'insights-fonts'
  link.rel = 'stylesheet'
  link.href =
    'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap'
  document.head.appendChild(link)
}

// ─── Data Maps ────────────────────────────────────────────────────────────────
const PERSONALITY_META = {
  'Budget Explorer': { emoji: '🎒', color: '#10b981', desc: "You love exploring the world while being smart with your money. Budget travel doesn't mean compromising on experiences!" },
  'Smart Traveler': { emoji: '🧠', color: '#3b82f6', desc: 'You strike the perfect balance between comfort and cost. You know how to get the best value for your money.' },
  'Comfort Seeker': { emoji: '🛋️', color: '#8b5cf6', desc: 'You believe in traveling comfortably and are willing to invest in premium experiences.' },
  'Luxury Traveler': { emoji: '💎', color: '#f59e0b', desc: 'You spare no expense. Luxury, exclusivity, and premium experiences are your hallmark.' },
  'New Traveler': { emoji: '🌱', color: '#6b7280', desc: "You're just beginning your travel journey. Every trip is a new adventure!" },
}

const PREF_ICONS = {
  Beach: '🏖️', 'Beach Lover': '🏖️',
  Mountain: '⛰️', 'Mountain Explorer': '⛰️',
  Cultural: '🏛️', 'Cultural Explorer': '🏛️',
  City: '🏙️', 'City Explorer': '🏙️',
  Explorer: '🗺️',
}

function getPrefIcon(pref) {
  if (!pref) return '🗺️'
  if (PREF_ICONS[pref]) return PREF_ICONS[pref]
  return PREF_ICONS[pref.split(' ')[0]] || '🗺️'
}

const DESTINATION_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#06b6d4', '#f59e0b']

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { return Number(n || 0).toLocaleString() }

// ─── Styles factory (dark / light) ───────────────────────────────────────────
function makeStyles(isDark) {
  return {
    // Layout
    page: {
      fontFamily: "'Manrope', sans-serif",
      minHeight: '100vh',
      padding: '0 0 60px',
    },

    // Stat cards row
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 20 },
    statCard: (grad) => ({
      borderRadius: 18, background: grad, padding: '22px 22px 20px',
      boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
      transition: 'transform 0.2s',
      cursor: 'default',
    }),
    statIcon: { fontSize: 26, marginBottom: 10 },
    statValue: { fontSize: 30, fontWeight: 800, color: 'white', fontFamily: "'Playfair Display',serif", letterSpacing: '-1px', marginBottom: 4 },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.05em' },

    // Panel card
    card: {
      borderRadius: 18, padding: 24,
      background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e4e8f4'}`,
      boxShadow: isDark ? 'none' : '0 4px 24px rgba(59,130,246,0.07)',
    },
    cardLabel: {
      fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase',
      color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b',
      marginBottom: 18,
    },

    // Personality hero
    personalityHero: (color) => ({
      borderRadius: 20,
      background: isDark
        ? `linear-gradient(135deg, ${color}25 0%, ${color}08 100%)`
        : `linear-gradient(135deg, ${color}18 0%, ${color}05 100%)`,
      border: `1.5px solid ${color}35`,
      textAlign: 'center',
      padding: '44px 28px',
      position: 'relative',
      overflow: 'hidden',
    }),
    personalityEmoji: { fontSize: 62, marginBottom: 14 },
    personalityTag: (color) => ({
      fontSize: 11, color: color, marginBottom: 8,
      textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 800,
    }),
    personalityName: (color) => ({
      fontFamily: "'Playfair Display',serif", fontSize: 36,
      fontWeight: 700, color: color, marginBottom: 12,
    }),
    personalityDesc: {
      fontSize: 15, color: isDark ? 'rgba(255,255,255,0.55)' : '#475569',
      maxWidth: 520, margin: '0 auto', lineHeight: 1.8,
    },

    // Bento row (vibe + stats)
    bentoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },

    // Vibe
    vibeEmoji: {
      fontSize: 52, background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(59,130,246,0.08)',
      borderRadius: '50%', width: 88, height: 88,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 14px',
    },
    vibeName: {
      fontSize: 22, fontWeight: 700,
      color: isDark ? '#e2e2e2' : '#1e293b',
      fontFamily: "'Playfair Display',serif",
    },
    vibeSubtext: { fontSize: 13, color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b', marginTop: 6 },

    // Stat row item
    statRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 14px', borderRadius: 12,
      background: isDark ? 'rgba(255,255,255,0.04)' : '#f0f7ff',
      marginBottom: 8,
    },
    statRowLabel: { fontSize: 13, color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' },
    statRowValue: { fontSize: 14, fontWeight: 700, color: '#3b82f6' },

    // Budget
    budgetMetaGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20,
    },
    budgetItem: (color) => ({
      textAlign: 'center', padding: '18px 12px', borderRadius: 14,
      background: `${color}10`, border: `1px solid ${color}25`,
    }),
    budgetItemLabel: { fontSize: 12, color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b', marginBottom: 8 },
    budgetItemValue: (color) => ({ fontSize: 20, fontWeight: 700, color, fontFamily: "'Playfair Display',serif" }),

    // Progress bar track
    progressTrack: {
      height: 10, borderRadius: 5,
      background: isDark ? '#1e2f4a' : '#e2e8f0',
    },

    // Destination tags
    destGrid: { display: 'flex', flexWrap: 'wrap', gap: 10 },
    destTag: (c) => ({
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 18px', borderRadius: 50,
      background: `${c}10`, border: `1px solid ${c}28`,
      fontSize: 13,
    }),
    destTagName: (c) => ({ fontWeight: 600, color: isDark ? '#e2e2e2' : '#1e293b' }),
    destTagCount: (c) => ({
      fontSize: 12, fontWeight: 700, color: c,
      background: `${c}20`, padding: '2px 10px', borderRadius: 20,
    }),

    // CTA
    cta: {
      borderRadius: 18,
      background: isDark
        ? 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.07))'
        : 'linear-gradient(135deg, rgba(59,130,246,0.07), rgba(99,102,241,0.04))',
      border: isDark ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(59,130,246,0.15)',
      padding: '28px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 16,
    },
    ctaTitle: { fontSize: 16, fontWeight: 700, color: isDark ? '#e2e2e2' : '#1e293b', marginBottom: 4 },
    ctaSub: { fontSize: 13, color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b' },
    ctaBtn: {
      padding: '12px 24px', borderRadius: 12, border: 'none',
      cursor: 'pointer', fontSize: 14, fontWeight: 700,
      background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
      color: 'white', whiteSpace: 'nowrap',
      boxShadow: '0 4px 18px rgba(99,102,241,0.35)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },

    // Header
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 },
    h1: { fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 700, color: isDark ? '#e2e2e2' : '#1e293b', marginBottom: 4 },
    sub: { fontSize: 14, color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b' },
    analyticsBtn: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 20px', borderRadius: 12, border: 'none',
      cursor: 'pointer', fontSize: 14, fontWeight: 700,
      background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
      color: 'white', boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
      transition: 'transform 0.2s',
    },

    // Overspend alert
    alert: {
      marginTop: 14, padding: '12px 16px', borderRadius: 12,
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
      fontSize: 13, color: '#ef4444',
    },

    // Section gap
    gap: { marginBottom: 20 },
  }
}

// ─── Hover helpers ────────────────────────────────────────────────────────────
function lift(e) { e.currentTarget.style.transform = 'translateY(-4px)' }
function drop(e) { e.currentTarget.style.transform = 'translateY(0)' }

// ─── Component ────────────────────────────────────────────────────────────────
export default function Insights() {
  const { user } = useAuth()
  const { t } = useTheme()
  const navigate = useNavigate()

  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  // Detect dark mode from your theme context
  // Adjust this check to match how your ThemeContext exposes the mode.
  // Common patterns: t.dark, t.mode === 'dark', t.isDark
  const isDark = !!(t.dark ?? t.isDark ?? (t.mode === 'dark') ?? false)

  const s = makeStyles(isDark)

  useEffect(() => {
    api.get(`/api/insights/${user.id}`)
      .then(r => setInsights(r.data.insights))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user.id])

  if (loading) return <Spinner />

  const meta = PERSONALITY_META[insights?.travel_personality] || PERSONALITY_META['New Traveler']

  if (!insights || insights.total_trips === 0) {
    return (
      <EmptyState
        icon="🗺️"
        title="No travel data yet"
        desc="Start logging your trips to unlock your personalized travel insights and yearly wrapped"
      />
    )
  }

  const ba = insights.budget_analysis || {}
  const utilPct = Math.min(ba.budget_utilization ?? 0, 100)
  const isOver = (ba.budget_utilization ?? 0) > 100
  const barColor = isOver ? '#ef4444' : 'linear-gradient(90deg,#3b82f6,#10b981)'

  return (
    <div style={s.page}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={s.header}>
        <div>
          <h1 style={s.h1}>Travel Wrapped ✨</h1>
          <p style={s.sub}>Your personalized travel insights for {new Date().getFullYear()}</p>
        </div>
        <button
          style={s.analyticsBtn}
          onMouseEnter={lift} onMouseLeave={drop}
          onClick={() => navigate('/analytics')}
        >
          📊 View Analytics
        </button>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div style={s.statGrid}>
        {[
          { label: 'Total Trips', value: insights.total_trips, icon: '✈️', grad: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
          { label: 'Total Spent', value: `₹${((insights.total_spent || 0) / 1000).toFixed(0)}K`, icon: '💸', grad: 'linear-gradient(135deg,#10b981,#059669)' },
          { label: 'Places Explored', value: insights.countries_visited ?? '–', icon: '📍', grad: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
          { label: 'Trips per Year', value: insights.travel_frequency ?? '–', icon: '📅', grad: 'linear-gradient(135deg,#f97316,#ea580c)' },
        ].map(card => (
          <div
            key={card.label}
            style={s.statCard(card.grad)}
            onMouseEnter={lift} onMouseLeave={drop}
          >
            <div style={s.statIcon}>{card.icon}</div>
            <p style={s.statValue}>{card.value}</p>
            <p style={s.statLabel}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── Personality Hero ────────────────────────────────────────────── */}
      <div style={{ ...s.personalityHero(meta.color), ...s.gap }}>
        {/* decorative blob */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 180, height: 180, borderRadius: '50%',
          background: `${meta.color}18`, pointerEvents: 'none',
        }} />
        <div style={s.personalityEmoji}>{meta.emoji}</div>
        <p style={s.personalityTag(meta.color)}>Your Travel Personality</p>
        <h2 style={s.personalityName(meta.color)}>{insights.travel_personality}</h2>
        <p style={s.personalityDesc}>{meta.desc}</p>
      </div>

      {/* ── Vibe + Quick Stats ──────────────────────────────────────────── */}
      <div style={s.bentoGrid}>
        {/* Travel Vibe */}
        <div style={s.card}>
          <p style={s.cardLabel}>Travel Vibe</p>
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div style={s.vibeEmoji}>{getPrefIcon(insights.travel_preference)}</div>
            <p style={s.vibeName}>{insights.travel_preference || 'Explorer'}</p>
            <p style={s.vibeSubtext}>Your signature travel style</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={s.card}>
          <p style={s.cardLabel}>Travel Stats</p>
          {[
            { label: 'Most Visited', value: insights.most_visited_destination || 'N/A', icon: '📍' },
            { label: 'Favorite Type', value: insights.favorite_place_category || 'N/A', icon: '🏆' },
            { label: 'Avg Trip Cost', value: `₹${fmt(insights.average_trip_cost)}`, icon: '💰' },
          ].map(row => (
            <div key={row.label} style={s.statRow}>
              <span style={s.statRowLabel}>{row.icon} {row.label}</span>
              <span style={s.statRowValue}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Budget Analysis ─────────────────────────────────────────────── */}
      {ba && Object.keys(ba).length > 0 && (
        <div style={{ ...s.card, ...s.gap }}>
          <p style={s.cardLabel}>Budget Analysis</p>

          <div style={s.budgetMetaGrid}>
            {[
              { label: 'Total Budget', value: `₹${fmt(ba.total_budget)}`, color: '#3b82f6' },
              { label: 'Actual Spending', value: `₹${fmt(ba.total_spent)}`, color: '#10b981' },
              { label: 'Budget Used', value: `${ba.budget_utilization}%`, color: isOver ? '#ef4444' : '#f59e0b' },
            ].map(item => (
              <div key={item.label} style={s.budgetItem(item.color)}>
                <p style={s.budgetItemLabel}>{item.label}</p>
                <p style={s.budgetItemValue(item.color)}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b' }}>Budget used</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: isOver ? '#ef4444' : '#10b981' }}>
              {ba.budget_utilization}%
            </span>
          </div>
          <div style={s.progressTrack}>
            <div style={{
              height: '100%', borderRadius: 5,
              width: `${utilPct}%`,
              background: barColor,
              transition: 'width 1.1s cubic-bezier(.4,0,.2,1)',
              boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
            }} />
          </div>

          {ba.overspend > 0 && (
            <div style={s.alert}>⚠️ Overspent by ₹{fmt(ba.overspend)}</div>
          )}
        </div>
      )}

      {/* ── Destinations ────────────────────────────────────────────────── */}
      {insights.destination_breakdown && Object.keys(insights.destination_breakdown).length > 0 && (
        <div style={{ ...s.card, ...s.gap }}>
          <p style={s.cardLabel}>Destinations Visited</p>
          <div style={s.destGrid}>
            {Object.entries(insights.destination_breakdown).map(([dest, count], i) => {
              const c = DESTINATION_COLORS[i % DESTINATION_COLORS.length]
              return (
                <div key={dest} style={s.destTag(c)}>
                  <span>📍</span>
                  <span style={s.destTagName(c)}>{dest}</span>
                  <span style={s.destTagCount(c)}>{count} trip{count > 1 ? 's' : ''}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <div style={s.cta}>
        <div>
          <p style={s.ctaTitle}>Want deeper insights?</p>
          <p style={s.ctaSub}>View charts, spending trends, behaviour analysis and more</p>
        </div>
        <button
          style={s.ctaBtn}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(99,102,241,0.35)' }}
          onClick={() => navigate('/analytics')}
        >
          📊 Open Analytics →
        </button>
      </div>

    </div>
  )
}