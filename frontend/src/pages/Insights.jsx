import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { Spinner, EmptyState } from '../design/UI'
import { useNavigate } from 'react-router-dom'

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
    borderStrong: '#c2c6d1',
    textPrimary: '#1c1c11',
    textSecond: '#424750',
    textMuted: '#727781',
    primary: '#003461',
    primaryFaded: '#004b8718',
    primaryFixed: '#d3e4ff',
    accent: '#1b6d24',
    accentFaded: '#1b6d2418',
    tertiary: '#611a07',
    navBg: 'rgba(253,250,231,0.85)',
    progressBg: '#e6e3d0',
    heroBg: '#004b87',
    heroSubText: '#8abcff',
    progressP: '#003461',
    progressA: '#1b6d24',
    progressT: '#611a07',
    // color-coded stat card bottom borders
    s1: { border: '#003461', iconBg: '#d3e4ff', iconColor: '#003461', badge: '#1b6d24' },
    s2: { border: '#1b6d24', iconBg: '#a0f399', iconColor: '#1b6d24', badge: '#727781' },
    s3: { border: '#611a07', iconBg: '#ffdbd2', iconColor: '#611a07', badge: '#611a07' },
    s4: { border: '#727781', iconBg: '#e6e3d0', iconColor: '#424750', badge: '#424750' },
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
    borderStrong: 'rgba(255,255,255,0.15)',
    textPrimary: '#f0f0f0',
    textSecond: '#b0b0b0',
    textMuted: '#666666',
    primary: '#a3c9ff',
    primaryFaded: '#a3c9ff14',
    primaryFixed: '#a3c9ff20',
    accent: '#4ae183',
    accentFaded: '#4ae18314',
    tertiary: '#ffb4a1',
    navBg: 'rgba(10,10,10,0.80)',
    progressBg: '#1e2f4a',
    heroBg: '#0d1f35',
    heroSubText: '#a3c9ff',
    progressP: '#3b82f6',
    progressA: '#10b981',
    progressT: '#f97316',
    // color-coded stat card bottom borders
    s1: { border: '#3b82f6', iconBg: '#3b82f618', iconColor: '#3b82f6', badge: '#10b981' },
    s2: { border: '#10b981', iconBg: '#10b98118', iconColor: '#10b981', badge: '#666666' },
    s3: { border: '#8b5cf6', iconBg: '#8b5cf618', iconColor: '#8b5cf6', badge: '#8b5cf6' },
    s4: { border: '#f97316', iconBg: '#f9731618', iconColor: '#f97316', badge: '#f97316' },
  },
}

// ─── Data Maps ────────────────────────────────────────────────────────────────
const PERSONALITY_META = {
  'Budget Explorer': { emoji: '🎒', archetype: 'The Thrifty Wanderer', desc: "You love exploring the world while being smart with your money. Budget travel doesn't mean compromising on experiences!" },
  'Smart Traveler': { emoji: '🧠', archetype: 'The Archetype', desc: 'You balance adventure with precision. Most trips were planned with a detailed itinerary, yet you always found space for serendipitous discovery.' },
  'Comfort Seeker': { emoji: '🛋️', archetype: 'The Refined Explorer', desc: 'You believe in traveling comfortably and are willing to invest in premium experiences that make every journey memorable.' },
  'Luxury Traveler': { emoji: '💎', archetype: 'The Elite Voyager', desc: 'You spare no expense. Luxury, exclusivity, and premium experiences are your hallmark wherever you roam.' },
  'New Traveler': { emoji: '🌱', archetype: 'The Fresh Adventurer', desc: "You're just beginning your travel journey. Every trip is a new adventure waiting to unfold!" },
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
  return PREF_ICONS[pref] || PREF_ICONS[pref?.split(' ')[0]] || '🗺️'
}

const DEST_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#06b6d4', '#f59e0b']
function fmt(n) { return Number(n || 0).toLocaleString('en-IN') }

// ─── Icons ────────────────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

// ─── Component ────────────────────────────────────────────────────────────────
export default function Insights() {
  const { user } = useAuth()
  const { dark: ctxDark } = useTheme()
  const navigate = useNavigate()

  const [isDark, setIsDark] = useState(ctxDark ?? false)
  useEffect(() => { if (ctxDark !== undefined) setIsDark(ctxDark) }, [ctxDark])
  const t = themes[isDark ? 'dark' : 'light']

  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/insights/${user.id}`)
      .then(r => setInsights(r.data.insights))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user.id])

  if (loading) return <Spinner />

  if (!insights || insights.total_trips === 0) {
    return (
      <EmptyState
        icon="🗺️"
        title="No travel data yet"
        desc="Start logging your trips to unlock your personalized travel insights"
      />
    )
  }

  const meta = PERSONALITY_META[insights?.travel_personality] || PERSONALITY_META['New Traveler']
  const ba = insights?.budget_analysis || {}
  const utilPct = Math.min(ba.budget_utilization ?? 0, 100)
  const isOver = (ba.budget_utilization ?? 0) > 100

  // Segmented budget bar proportions
  const staysPct = +(utilPct * 0.55).toFixed(1)
  const flightsPct = +(utilPct * 0.25).toFixed(1)
  const diningPct = +(Math.max(0, utilPct - staysPct - flightsPct)).toFixed(1)

  const statCards = [
    {
      label: 'Total Trips',
      value: insights.total_trips,
      icon: '✈️',
      badge: `+${Math.max(1, Math.round((insights.total_trips || 0) * 0.12))} vs last yr`,
      s: t.s1,
    },
    {
      label: 'Total Spent',
      value: `₹${fmt(insights.total_spent || 0)}`,
      icon: '💸',
      badge: isOver ? 'Over Budget' : 'Within Budget',
      s: t.s2,
    },
    {
      label: 'Places Explored',
      value: insights.countries_visited ?? '–',
      icon: '📍',
      badge: 'New Milestone',
      s: t.s3,
    },
    {
      label: 'Trips per Year',
      value: insights.travel_frequency ?? '–',
      icon: '📅',
      badge: 'Consistent',
      s: t.s4,
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Lora:ital,wght@0,700;1,700&display=swap');
        * { box-sizing: border-box; }
        @keyframes ins-fade { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        .ins-hover  { transition: transform 0.22s, box-shadow 0.22s; cursor:default; }
        .ins-hover:hover { transform: translateY(-3px); }
        .ins-btn    { transition: opacity 0.18s, transform 0.18s; cursor:pointer; }
        .ins-btn:hover  { opacity: 0.85; transform: scale(1.02); }
        .ins-tag    { transition: border-color 0.18s, transform 0.18s; cursor:default; }
        .ins-tag:hover  { transform: scale(1.03); }
      `}</style>

      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Manrope, sans-serif', transition: 'background 0.3s' }}>

        {/* dot-grid background — matches TripLogger */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `radial-gradient(${isDark ? 'rgba(163,201,255,0.07)' : 'rgba(0,52,97,0.06)'} 1px, transparent 1px)`,
          backgroundSize: '38px 38px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1080, margin: '0 auto', padding: '0 24px 100px' }}>

          {/* ── Nav ─────────────────────────────────────────────────────── */}
          <nav style={{
            position: 'sticky', top: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            height: 68,
            background: t.navBg, backdropFilter: 'blur(18px)',
            borderBottom: `1px solid ${t.border}`,
            margin: '0 -24px', padding: '0 24px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: t.accent }}>
              Travel Journal
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                className="ins-btn"
                onClick={() => navigate('/analytics')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px', borderRadius: 12,
                  background: t.primaryFaded, border: `1px solid ${t.border}`,
                  color: t.primary, fontSize: 12, fontWeight: 700,
                  fontFamily: 'Manrope, sans-serif', letterSpacing: '0.5px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = t.primary; e.currentTarget.style.color = isDark ? '#001e3c' : '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = t.primaryFaded; e.currentTarget.style.color = t.primary }}
              >
                📊 Analytics <ArrowIcon />
              </button>
              {/* Dark/Light toggle — identical to TripLogger */}
              <button
                onClick={() => setIsDark(d => !d)}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: t.surface, border: `1px solid ${t.border}`,
                  color: t.textMuted, cursor: 'pointer', transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = t.primaryFaded; e.currentTarget.style.color = t.primary }}
                onMouseLeave={e => { e.currentTarget.style.background = t.surface; e.currentTarget.style.color = t.textMuted }}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </nav>

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <header style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            flexWrap: 'wrap', gap: 16, margin: '48px 0 36px',
            animation: 'ins-fade 0.45s ease both',
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: t.accent, margin: '0 0 10px' }}>
                Your Year in Travel
              </p>
              <h1 style={{
                fontSize: 'clamp(36px,5vw,58px)', fontWeight: 900,
                letterSpacing: '-2px', color: t.primary,
                lineHeight: 1, margin: '0 0 10px', fontFamily: 'Manrope, sans-serif',
              }}>Travel Wrapped ✨</h1>
              <p style={{ fontSize: 15, color: t.textMuted, margin: 0 }}>
                Your personalized travel insights for {new Date().getFullYear()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="ins-btn" style={{
                padding: '11px 22px', borderRadius: 12,
                background: t.cardHigh, border: `1px solid ${t.border}`,
                color: t.primary, fontWeight: 700, fontSize: 13, fontFamily: 'Manrope, sans-serif',
              }}>Share Report</button>
              <button className="ins-btn" style={{
                padding: '11px 22px', borderRadius: 12,
                background: t.primary, border: 'none',
                color: isDark ? '#001e3c' : '#fff',
                fontWeight: 700, fontSize: 13, fontFamily: 'Manrope, sans-serif',
              }}>Export PDF</button>
            </div>
          </header>

          {/* ── 4 Stat Cards — flat, color-coded bottom border ──────────── */}
          <section style={{
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
            gap: 18, marginBottom: 36,
            animation: 'ins-fade 0.45s 0.08s ease both',
          }}>
            {statCards.map((card) => (
              <div key={card.label} className="ins-hover" style={{
                background: t.cardLow,
                borderRadius: 16,
                padding: '28px 24px 24px',
                border: `1px solid ${t.border}`,
                borderBottom: `4px solid ${card.s.border}`,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 12px 32px rgba(28,28,17,0.07)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                minHeight: 180,
              }}>
                {/* top: icon + badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: card.s.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>{card.icon}</div>
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase',
                    color: card.s.badge,
                    background: `${card.s.border}12`,
                    border: `1px solid ${card.s.border}25`,
                    padding: '3px 9px', borderRadius: 999,
                  }}>{card.badge}</span>
                </div>
                {/* bottom: label + value */}
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 6px' }}>
                    {card.label}
                  </p>
                  <p style={{ fontSize: 32, fontWeight: 900, color: t.textPrimary, margin: 0, letterSpacing: '-1px', fontFamily: 'Lora, serif', lineHeight: 1 }}>
                    {card.value}
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* ── Personality Hero + Vibe ──────────────────────────────────── */}
          <section style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr',
            gap: 20, marginBottom: 36,
            animation: 'ins-fade 0.45s 0.16s ease both',
          }}>
            {/* Personality card */}
            <div style={{
              borderRadius: 20,
              background: t.heroBg,
              overflow: 'hidden', position: 'relative',
              minHeight: 380, padding: '48px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,52,97,0.18)',
            }}>
              {/* crosshatch texture overlay */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 0, opacity: 0.5,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />
              {/* gradient overlay */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)',
              }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <span style={{ fontSize: 42 }}>{meta.emoji}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase',
                    color: t.heroSubText,
                  }}>{meta.archetype}</span>
                </div>
                <h2 style={{
                  fontSize: 'clamp(32px,4vw,54px)', fontWeight: 700,
                  fontFamily: 'Lora, serif', fontStyle: 'italic',
                  color: '#fff', margin: '0 0 16px', letterSpacing: '-1px', lineHeight: 1.1,
                }}>{insights.travel_personality}</h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', maxWidth: 480, lineHeight: 1.8, margin: 0 }}>
                  {meta.desc}
                </p>
              </div>
            </div>

            {/* Vibe card */}
            <div style={{
              borderRadius: 20,
              background: t.cardHighest,
              border: `1px solid ${t.border}`,
              padding: '36px 28px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(28,28,17,0.06)',
            }}>
              <div>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: t.card, border: `1px solid ${t.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, marginBottom: 18,
                  boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(28,28,17,0.08)',
                }}>
                  {getPrefIcon(insights.travel_preference)}
                </div>
                <h3 style={{
                  fontSize: 26, fontWeight: 800, color: t.primary,
                  margin: '0 0 10px', fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.5px',
                }}>{insights.travel_preference || 'Explorer'}</h3>
                <p style={{ fontSize: 13, color: t.textSecond, lineHeight: 1.7, margin: 0 }}>
                  Your most common travel style. Your core vibe defines every journey.
                </p>
              </div>
              {/* affinity bar */}
              <div style={{ marginTop: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.accent }}>
                    Style Affinity
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: t.accent }}>
                    {utilPct >= 80 ? '92%' : utilPct >= 50 ? '74%' : '58%'}
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: t.progressBg, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    width: utilPct >= 80 ? '92%' : utilPct >= 50 ? '74%' : '58%',
                    background: t.accent,
                    transition: 'width 1s cubic-bezier(.4,0,.2,1)',
                  }} />
                </div>
              </div>
            </div>
          </section>

          {/* ── Journal Highlights + Budget Utilization ──────────────────── */}
          <section style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 36, marginBottom: 36,
            animation: 'ins-fade 0.45s 0.24s ease both',
          }}>

            {/* Journal Highlights table */}
            <div>
              <h3 style={{
                fontSize: 24, fontWeight: 900, color: t.primary,
                letterSpacing: '-0.5px', margin: '0 0 20px',
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'Manrope, sans-serif',
              }}>
                <span>📋</span> Journal Highlights
              </h3>
              <div style={{
                borderRadius: 16, overflow: 'hidden',
                background: t.cardLow, border: `1px solid ${t.border}`,
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 12px 32px rgba(28,28,17,0.06)',
              }}>
                {[
                  { label: 'Most Visited', value: insights.most_visited_destination || 'N/A' },
                  { label: 'Favorite Type', value: insights.favorite_place_category || 'N/A' },
                  { label: 'Avg Trip Cost', value: `₹${fmt(insights.average_trip_cost)}` },
                ].map((row, i) => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '22px 28px',
                    borderBottom: i < 2 ? `1px solid ${t.border}` : 'none',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted }}>
                      {row.label}
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: t.primary, fontFamily: 'Manrope, sans-serif' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Utilization */}
            <div>
              <h3 style={{
                fontSize: 24, fontWeight: 900, color: t.primary,
                letterSpacing: '-0.5px', margin: '0 0 20px',
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'Manrope, sans-serif',
              }}>
                <span>💰</span> Budget Utilization
              </h3>
              <div style={{
                borderRadius: 16,
                background: t.cardLow, border: `1px solid ${t.border}`,
                padding: '28px 28px 24px',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 12px 32px rgba(28,28,17,0.06)',
              }}>
                {/* totals row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 6px' }}>
                      Annual Budget
                    </p>
                    <p style={{ fontSize: 28, fontWeight: 900, color: t.textPrimary, margin: 0, fontFamily: 'Lora, serif', lineHeight: 1 }}>
                      ₹{fmt(ba.total_budget)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 6px' }}>
                      {isOver ? 'Overspent' : 'Remaining'}
                    </p>
                    <p style={{
                      fontSize: 28, fontWeight: 900, margin: 0, fontFamily: 'Lora, serif', lineHeight: 1,
                      color: isOver ? '#ef4444' : t.accent,
                    }}>
                      ₹{isOver
                        ? fmt(ba.overspend)
                        : fmt(Math.max(0, (ba.total_budget || 0) - (ba.total_spent || 0)))}
                    </p>
                  </div>
                </div>

                {/* header row for bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
                    padding: '3px 10px', borderRadius: 999,
                    background: t.primaryFixed, color: t.primary,
                  }}>Expenses</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: isOver ? '#ef4444' : t.primary }}>
                    {ba.budget_utilization}% Used
                  </span>
                </div>

                {/* segmented bar */}
                <div style={{ height: 14, borderRadius: 7, overflow: 'hidden', background: t.progressBg, display: 'flex', marginBottom: 12 }}>
                  <div style={{ width: `${staysPct}%`, background: t.progressP, transition: 'width 1.1s cubic-bezier(.4,0,.2,1)' }} />
                  <div style={{ width: `${flightsPct}%`, background: t.progressA, transition: 'width 1.1s cubic-bezier(.4,0,.2,1)' }} />
                  <div style={{ width: `${diningPct}%`, background: t.progressT, transition: 'width 1.1s cubic-bezier(.4,0,.2,1)' }} />
                </div>

                {/* legend */}
                <div style={{ display: 'flex', gap: 18 }}>
                  {[
                    { label: 'Stays', color: t.progressP },
                    { label: 'Flights', color: t.progressA },
                    { label: 'Dining', color: t.progressT },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: t.textMuted }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {isOver && (
                  <div style={{
                    marginTop: 16, padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    fontSize: 12, color: '#ef4444',
                  }}>⚠️ Overspent by ₹{fmt(ba.overspend)}</div>
                )}
              </div>
            </div>
          </section>

          {/* ── Destination Tag Cloud ────────────────────────────────────── */}
          {insights.destination_breakdown && Object.keys(insights.destination_breakdown).length > 0 && (
            <section style={{ marginBottom: 36, animation: 'ins-fade 0.45s 0.32s ease both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <h3 style={{
                  fontSize: 26, fontWeight: 900, color: t.primary,
                  letterSpacing: '-0.5px', margin: 0, fontFamily: 'Manrope, sans-serif',
                }}>Map of Memories</h3>
                <span style={{ fontSize: 13, color: t.textMuted }}>
                  {Object.keys(insights.destination_breakdown).length} destinations visited
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {Object.entries(insights.destination_breakdown).map(([dest, count], i) => {
                  const c = DEST_COLORS[i % DEST_COLORS.length]
                  return (
                    <div
                      key={dest}
                      className="ins-tag"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 22px', borderRadius: 999,
                        background: isDark ? t.cardHigh : t.cardHighest,
                        border: `1px solid ${t.border}`,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = c }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 700, color: t.primary }}>{dest}</span>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: t.textMuted, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: t.textMuted }}>{count} visit{count > 1 ? 's' : ''}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── CTA Banner ──────────────────────────────────────────────── */}
          <section style={{
            borderRadius: 24,
            background: t.cardHighest,
            border: `1px solid ${isDark ? t.border : 'rgba(0,52,97,0.06)'}`,
            padding: '48px',
            position: 'relative', overflow: 'hidden',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 24,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(28,28,17,0.06)',
            animation: 'ins-fade 0.45s 0.4s ease both',
          }}>
            {/* decorative blob */}
            <div style={{
              position: 'absolute', bottom: -80, right: -80,
              width: 320, height: 320, borderRadius: '50%',
              background: isDark ? 'rgba(163,201,255,0.04)' : 'rgba(0,52,97,0.05)',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
              <h3 style={{
                fontSize: 32, fontWeight: 900, color: t.primary,
                letterSpacing: '-1px', margin: '0 0 12px', fontFamily: 'Manrope, sans-serif',
              }}>Want deeper insights?</h3>
              <p style={{ fontSize: 15, color: t.textSecond, lineHeight: 1.7, margin: '0 0 24px' }}>
                Unlock full route breakdowns, spending trends, behaviour analysis and forecasts for your next trip.
              </p>
              <button
                className="ins-btn"
                onClick={() => navigate('/analytics')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '14px 28px', borderRadius: 12, border: 'none',
                  background: t.primary, color: isDark ? '#001e3c' : '#fff',
                  fontSize: 14, fontWeight: 700, fontFamily: 'Manrope, sans-serif',
                  boxShadow: `0 6px 20px ${isDark ? 'rgba(163,201,255,0.2)' : 'rgba(0,52,97,0.2)'}`,
                }}
              >
                View Full Analytics <ArrowIcon />
              </button>
            </div>

            {/* rotated decorative map tile */}
            <div style={{
              position: 'relative', zIndex: 1, flexShrink: 0,
              width: 200, height: 200, borderRadius: 20,
              overflow: 'hidden',
              transform: 'rotate(3deg)',
              boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(28,28,17,0.15)',
              background: isDark
                ? 'linear-gradient(135deg,#1a1a1a,#2a2a2a)'
                : 'linear-gradient(135deg,#f1eedb,#e6e3d0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 72,
            }}>🗺️</div>
          </section>

        </div>
      </div>
    </>
  )
}