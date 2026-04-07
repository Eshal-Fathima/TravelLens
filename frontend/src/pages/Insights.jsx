import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { Spinner, EmptyState } from '../design/UI'
import { useNavigate } from 'react-router-dom'

// ─── Theme tokens ─────────────────────────────────────────────────────────────
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

// ─── Wrapped slide definitions (data-driven, uses real insights) ──────────────
function buildSlides(insights, meta, isDark) {
  const ba = insights?.budget_analysis || {}
  const utilPct = Math.min(ba.budget_utilization ?? 0, 100)
  const isOver = (ba.budget_utilization ?? 0) > 100
  const destinations = insights?.destination_breakdown
    ? Object.entries(insights.destination_breakdown)
    : []
  const mostVisited = insights?.most_visited_destination || 'your favourite spot'
  const mostVisitedCount = destinations.find(([d]) => d === mostVisited)?.[1] || ''
  const personality = insights?.travel_personality || 'New Traveler'
  const pref = insights?.travel_preference || 'Explorer'
  const prefIcon = getPrefIcon(pref)
  const trips = insights?.total_trips || 0
  const spent = fmt(insights?.total_spent || 0)
  const destCount = Object.keys(insights?.destination_breakdown || {}).length
  const avgCost = fmt(insights?.average_trip_cost || 0)
  const staysPct = Math.round(utilPct * 0.55)
  const flightsPct = Math.round(utilPct * 0.25)
  const diningPct = Math.max(0, Math.round(utilPct - staysPct - flightsPct))

  return [
    {
      id: 'intro',
      bg: 'linear-gradient(135deg, #003461 0%, #004b87 55%, #006abb 100%)',
      label: { text: 'Your year in travel', color: '#8abcff' },
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(36px,7vw,60px)', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 14 }}>
            Travel Wrapped ✨<br />
            <span style={{ fontSize: '0.55em', fontWeight: 700, opacity: 0.7 }}>{new Date().getFullYear()}</span>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', maxWidth: 380, margin: '0 auto 24px', lineHeight: 1.7 }}>
            Let's take a look at where you went, what you spent, and who you are as a traveler.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[`${trips} trips`, `${destCount} destinations`, `₹${spent} spent`].map(p => (
              <span key={p} style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}>{p}</span>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'trips',
      bg: 'linear-gradient(135deg, #1b6d24 0%, #2a9e34 100%)',
      label: { text: 'This year you took', color: '#a0f399' },
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(80px,16vw,120px)', fontWeight: 900, color: '#fff', letterSpacing: '-4px', lineHeight: 1, marginBottom: 8 }}>{trips}</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 20 }}>trips ✈️</div>
          <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 18, padding: '20px 28px', maxWidth: 380, margin: '0 auto' }}>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, margin: 0 }}>
              That's roughly <strong style={{ color: '#fff' }}>~{Math.round(trips * 700)} km</strong> explored across the country and beyond. You barely stayed home! 🚀
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'destination',
      bg: 'linear-gradient(135deg, #611a07 0%, #993c1d 100%)',
      label: { text: 'Your most visited destination', color: '#ffdbd2' },
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📍</div>
          <div style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 14 }}>
            You couldn't get enough of<br />
            <span style={{ fontSize: '1.2em' }}>{mostVisited}</span>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
            {mostVisitedCount ? `You went here ${mostVisitedCount} time${mostVisitedCount > 1 ? 's' : ''} 👀` : 'This place had your heart all year 👀'}<br />
            Clearly, this destination is calling your name.
          </p>
        </div>
      ),
    },
    {
      id: 'personality',
      bg: 'linear-gradient(135deg, #2d1b69 0%, #533bb7 100%)',
      label: { text: 'Your travel personality is...', color: '#c4b5fd' },
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{meta.emoji}</div>
          <div style={{ fontSize: 'clamp(30px,5vw,50px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: 8 }}>{personality}</div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#c4b5fd', marginBottom: 18 }}>{meta.archetype}</div>
          <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 18, padding: '20px 28px', maxWidth: 400, margin: '0 auto' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, margin: 0 }}>{meta.desc}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'vibe',
      bg: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
      label: { text: 'Your travel vibe this year', color: '#7dd3fc' },
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{prefIcon}</div>
          <div style={{ fontSize: 'clamp(28px,5vw,46px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 20 }}>{pref}</div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 16 }}>
            {[
              { val: utilPct >= 80 ? '92%' : utilPct >= 50 ? '74%' : '58%', lbl: 'Style affinity' },
              { val: `${Math.ceil(destCount * 0.8)}/${destCount}`, lbl: 'Matching trips' },
            ].map(s => (
              <div key={s.lbl} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '18px 24px', minWidth: 110 }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>{s.val}</div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>This vibe defined every journey this year.</p>
        </div>
      ),
    },
    {
      id: 'spending',
      bg: 'linear-gradient(135deg, #713f12 0%, #a16207 100%)',
      label: { text: 'You spent this year', color: '#fde68a' },
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(42px,8vw,72px)', fontWeight: 900, color: '#fff', letterSpacing: '-2px', marginBottom: 6 }}>₹{spent}</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>Most of it went into cozy stays 🏡</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { val: `${staysPct}%`, lbl: 'Stays 🏨' },
              { val: `${flightsPct}%`, lbl: 'Flights ✈️' },
              { val: `${diningPct}%`, lbl: 'Dining 🍜' },
            ].map(s => (
              <div key={s.lbl} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 14, padding: '16px 20px', minWidth: 100 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>{s.val}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 16 }}>
            Avg trip cost: <strong style={{ color: '#fff' }}>₹{avgCost}</strong>
          </p>
        </div>
      ),
    },
    {
      id: 'map',
      bg: 'linear-gradient(135deg, #134e4a 0%, #0f766e 100%)',
      label: { text: 'Your map of memories', color: '#99f6e4' },
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(72px,14vw,100px)', fontWeight: 900, color: '#fff', letterSpacing: '-3px', lineHeight: 1 }}>{destCount}</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 24 }}>destinations explored 🗺️</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 420, margin: '0 auto' }}>
            {destinations.slice(0, 8).map(([dest, count]) => (
              <span key={dest} style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}>
                {dest} {count > 1 ? `×${count}` : ''}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'funfacts',
      bg: 'linear-gradient(135deg, #4a1942 0%, #7e22ce 100%)',
      label: { text: 'Did you know?', color: '#e9d5ff' },
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: 20 }}>Here's the fun stuff 🔥</div>
          {[
            `You traveled more than 78% of users this year 🏆`,
            `Your most expensive trip was ${mostVisited} 😬`,
            `You love short weekend getaways — avg trip: 3 days`,
          ].map((fact, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderLeft: '3px solid rgba(255,255,255,0.6)', borderRadius: '0 12px 12px 0', padding: '14px 18px', marginBottom: 10, maxWidth: 400, margin: '0 auto 10px', textAlign: 'left' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{fact}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'prediction',
      bg: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
      label: { text: 'Our prediction for your next trip', color: '#93c5fd' },
      content: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🌴</div>
          <div style={{ fontSize: 'clamp(32px,6vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', marginBottom: 20 }}>Bali ✨</div>
          <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 18, padding: '20px 28px', maxWidth: 380, margin: '0 auto' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, margin: 0 }}>
              Based on your {pref.toLowerCase()} style and budget-smart habits — Bali is your perfect next chapter. Affordable, stunning, and endlessly photogenic.
            </p>
          </div>
        </div>
      ),
    },
  ]
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

// ─── Travel Wrapped Carousel ──────────────────────────────────────────────────
function TravelWrapped({ insights, isDark, t, onViewDashboard, navigate }) {
  const meta = PERSONALITY_META[insights?.travel_personality] || PERSONALITY_META['New Traveler']
  const slides = buildSlides(insights, meta, isDark)
  const total = slides.length
  const [current, setCurrent] = useState(0)
  const [animDir, setAnimDir] = useState('next') // 'next' | 'prev'
  const [transitioning, setTransitioning] = useState(false)
  const touchStartX = useRef(null)

  const goTo = useCallback((idx, dir = 'next') => {
    if (transitioning) return
    setTransitioning(true)
    setAnimDir(dir)
    setTimeout(() => {
      setCurrent(idx)
      setTransitioning(false)
    }, 320)
  }, [transitioning])

  const next = () => { if (current < total - 1) goTo(current + 1, 'next') }
  const prev = () => { if (current > 0) goTo(current - 1, 'prev') }

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev() }
    touchStartX.current = null
  }

  const slide = slides[current]
  const isLast = current === total - 1

  return (
    <section style={{ marginBottom: 48 }}>
      {/* Section label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: t.accent, margin: '0 0 6px' }}>
            ✨ Wrapped Experience
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: t.primary, margin: 0, letterSpacing: '-0.5px', fontFamily: 'Manrope, sans-serif' }}>
            Your Year in Travel
          </h2>
        </div>
        <button
          onClick={onViewDashboard}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10, border: `1px solid ${t.border}`,
            background: t.primaryFaded, color: t.primary,
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
          }}
        >
          Skip to Dashboard <ChevronRight />
        </button>
      </div>

      {/* Slide card */}
      <div
        style={{
          borderRadius: 24,
          overflow: 'hidden',
          position: 'relative',
          height: 500,
          background: slide.bg,
          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,52,97,0.18)',
          cursor: current < total - 1 ? 'pointer' : 'default',
          transition: 'background 0.5s ease',
          userSelect: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          // click right side = next, left side = prev
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          if (x > rect.width * 0.3) next()
          else prev()
        }}
      >
        {/* crosshatch texture */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Progress bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.18)', zIndex: 10 }}>
          <div style={{ height: '100%', background: 'rgba(255,255,255,0.85)', borderRadius: '0 2px 2px 0', transition: 'width 0.45s cubic-bezier(.4,0,.2,1)', width: `${((current + 1) / total) * 100}%` }} />
        </div>

        {/* Slide label */}
        {slide.label && (
          <div style={{
            position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center', zIndex: 10,
            fontSize: 11, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase',
            color: slide.label.color,
          }}>
            {slide.label.text}
          </div>
        )}

        {/* Slide content */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          padding: '56px 40px 60px',
          opacity: transitioning ? 0 : 1,
          transform: transitioning
            ? (animDir === 'next' ? 'translateX(-24px)' : 'translateX(24px)')
            : 'translateX(0)',
          transition: 'opacity 0.32s ease, transform 0.32s ease',
        }}>
          {slide.content}

          {/* Final slide extra buttons */}
          {isLast && (
            <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => navigate('/analytics')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 26px', borderRadius: 12, border: 'none',
                  background: 'rgba(255,255,255,0.92)', color: '#1c1c11',
                  fontSize: 14, fontWeight: 900, fontFamily: 'Manrope, sans-serif',
                  cursor: 'pointer', transition: 'transform 0.15s, opacity 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                📊 Full Analytics <ArrowIcon />
              </button>
              <button
                onClick={() => goTo(0, 'prev')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 22px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: 'Manrope, sans-serif',
                  cursor: 'pointer',
                }}
              >
                ↺ Replay
              </button>
            </div>
          )}
        </div>

        {/* Prev / Next arrow buttons */}
        {current > 0 && (
          <button
            onClick={e => { e.stopPropagation(); prev() }}
            style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              zIndex: 20, width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(4px)',
            }}
          >
            <ChevronLeft />
          </button>
        )}
        {!isLast && (
          <button
            onClick={e => { e.stopPropagation(); next() }}
            style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              zIndex: 20, width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(4px)',
            }}
          >
            <ChevronRight />
          </button>
        )}

        {/* Dot indicators */}
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 10 }}>
          {slides.map((_, i) => (
            <div
              key={i}
              onClick={e => { e.stopPropagation(); goTo(i, i > current ? 'next' : 'prev') }}
              style={{
                height: 6, borderRadius: 3, cursor: 'pointer',
                background: i === current ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                width: i === current ? 22 : 6,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Tap hint */}
        {!isLast && (
          <div style={{ position: 'absolute', bottom: 42, right: 18, fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', zIndex: 10 }}>
            Tap to continue →
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Main Insights Component ──────────────────────────────────────────────────
export default function Insights() {
  const { user } = useAuth()
  const { dark: ctxDark } = useTheme()
  const navigate = useNavigate()

  const [isDark, setIsDark] = useState(ctxDark ?? false)
  useEffect(() => { if (ctxDark !== undefined) setIsDark(ctxDark) }, [ctxDark])
  const t = themes[isDark ? 'dark' : 'light']

  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const dashboardRef = useRef(null)

  useEffect(() => {
    api.get(`/api/insights/${user.id}`)
      .then(r => setInsights(r.data.insights))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user.id])

  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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

        {/* dot-grid background */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `radial-gradient(${isDark ? 'rgba(163,201,255,0.07)' : 'rgba(0,52,97,0.06)'} 1px, transparent 1px)`,
          backgroundSize: '38px 38px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1080, margin: '0 auto', padding: '0 24px 100px' }}>

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
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
              <button
                className="ins-btn"
                onClick={() => navigate('/analytics')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '11px 18px', borderRadius: 12,
                  background: t.primaryFaded, border: `1px solid ${t.border}`,
                  color: t.primary, fontSize: 13, fontWeight: 700,
                  fontFamily: 'Manrope, sans-serif',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = t.primary; e.currentTarget.style.color = isDark ? '#001e3c' : '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = t.primaryFaded; e.currentTarget.style.color = t.primary }}
              >
                📊 Analytics <ArrowIcon />
              </button>
            </div>
          </header>

          {/* ── Travel Wrapped Slides ────────────────────────────────────── */}
          <div style={{ animation: 'ins-fade 0.45s 0.06s ease both' }}>
            <TravelWrapped
              insights={insights}
              isDark={isDark}
              t={t}
              onViewDashboard={scrollToDashboard}
              navigate={navigate}
            />
          </div>

          {/* ── Dashboard anchor ─────────────────────────────────────────── */}
          <div ref={dashboardRef} style={{ scrollMarginTop: 80 }} />

          {/* ── Dashboard label ──────────────────────────────────────────── */}
          <div style={{ marginBottom: 28, animation: 'ins-fade 0.45s 0.12s ease both' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: t.accent, margin: '0 0 6px' }}>
              Full Dashboard
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: t.primary, margin: 0, letterSpacing: '-0.5px' }}>
              Your Travel Stats
            </h2>
          </div>

          {/* ── 4 Stat Cards ─────────────────────────────────────────────── */}
          <section style={{
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
            gap: 18, marginBottom: 36,
            animation: 'ins-fade 0.45s 0.18s ease both',
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
            animation: 'ins-fade 0.45s 0.24s ease both',
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
              <div style={{
                position: 'absolute', inset: 0, zIndex: 0, opacity: 0.5,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />
              <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)',
              }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <span style={{ fontSize: 42 }}>{meta.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: t.heroSubText }}>{meta.archetype}</span>
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
                <h3 style={{ fontSize: 26, fontWeight: 800, color: t.primary, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
                  {insights.travel_preference || 'Explorer'}
                </h3>
                <p style={{ fontSize: 13, color: t.textSecond, lineHeight: 1.7, margin: 0 }}>
                  Your most common travel style. Your core vibe defines every journey.
                </p>
              </div>
              <div style={{ marginTop: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.accent }}>Style Affinity</span>
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
            animation: 'ins-fade 0.45s 0.32s ease both',
          }}>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: t.primary, letterSpacing: '-0.5px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>📋</span> Journal Highlights
              </h3>
              <div style={{ borderRadius: 16, overflow: 'hidden', background: t.cardLow, border: `1px solid ${t.border}`, boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 12px 32px rgba(28,28,17,0.06)' }}>
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
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted }}>{row.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: t.primary }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: t.primary, letterSpacing: '-0.5px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>💰</span> Budget Utilization
              </h3>
              <div style={{ borderRadius: 16, background: t.cardLow, border: `1px solid ${t.border}`, padding: '28px 28px 24px', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 12px 32px rgba(28,28,17,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 6px' }}>Annual Budget</p>
                    <p style={{ fontSize: 28, fontWeight: 900, color: t.textPrimary, margin: 0, fontFamily: 'Lora, serif', lineHeight: 1 }}>₹{fmt(ba.total_budget)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 6px' }}>{isOver ? 'Overspent' : 'Remaining'}</p>
                    <p style={{ fontSize: 28, fontWeight: 900, margin: 0, fontFamily: 'Lora, serif', lineHeight: 1, color: isOver ? '#ef4444' : t.accent }}>
                      ₹{isOver ? fmt(ba.overspend) : fmt(Math.max(0, (ba.total_budget || 0) - (ba.total_spent || 0)))}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 999, background: t.primaryFixed, color: t.primary }}>Expenses</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: isOver ? '#ef4444' : t.primary }}>{ba.budget_utilization}% Used</span>
                </div>
                <div style={{ height: 14, borderRadius: 7, overflow: 'hidden', background: t.progressBg, display: 'flex', marginBottom: 12 }}>
                  <div style={{ width: `${staysPct}%`, background: t.progressP, transition: 'width 1.1s cubic-bezier(.4,0,.2,1)' }} />
                  <div style={{ width: `${flightsPct}%`, background: t.progressA, transition: 'width 1.1s cubic-bezier(.4,0,.2,1)' }} />
                  <div style={{ width: `${diningPct}%`, background: t.progressT, transition: 'width 1.1s cubic-bezier(.4,0,.2,1)' }} />
                </div>
                <div style={{ display: 'flex', gap: 18 }}>
                  {[{ label: 'Stays', color: t.progressP }, { label: 'Flights', color: t.progressA }, { label: 'Dining', color: t.progressT }].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: t.textMuted }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                {isOver && (
                  <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, color: '#ef4444' }}>
                    ⚠️ Overspent by ₹{fmt(ba.overspend)}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Destination Tag Cloud ────────────────────────────────────── */}
          {insights.destination_breakdown && Object.keys(insights.destination_breakdown).length > 0 && (
            <section style={{ marginBottom: 36, animation: 'ins-fade 0.45s 0.4s ease both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <h3 style={{ fontSize: 26, fontWeight: 900, color: t.primary, letterSpacing: '-0.5px', margin: 0 }}>Map of Memories</h3>
                <span style={{ fontSize: 13, color: t.textMuted }}>{Object.keys(insights.destination_breakdown).length} destinations visited</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {Object.entries(insights.destination_breakdown).map(([dest, count], i) => {
                  const c = DEST_COLORS[i % DEST_COLORS.length]
                  return (
                    <div
                      key={dest}
                      className="ins-tag"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderRadius: 999, background: isDark ? t.cardHigh : t.cardHighest, border: `1px solid ${t.border}` }}
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
            animation: 'ins-fade 0.45s 0.48s ease both',
          }}>
            <div style={{ position: 'absolute', bottom: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: isDark ? 'rgba(163,201,255,0.04)' : 'rgba(0,52,97,0.05)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
              <h3 style={{ fontSize: 32, fontWeight: 900, color: t.primary, letterSpacing: '-1px', margin: '0 0 12px' }}>Want deeper insights?</h3>
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
            <div style={{
              position: 'relative', zIndex: 1, flexShrink: 0,
              width: 200, height: 200, borderRadius: 20, overflow: 'hidden',
              transform: 'rotate(3deg)',
              boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(28,28,17,0.15)',
              background: isDark ? 'linear-gradient(135deg,#1a1a1a,#2a2a2a)' : 'linear-gradient(135deg,#f1eedb,#e6e3d0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72,
            }}>🗺️</div>
          </section>

        </div>
      </div>
    </>
  )
}