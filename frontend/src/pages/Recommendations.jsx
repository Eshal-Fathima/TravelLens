import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
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
    primaryContainer: '#004b87',
    accent: '#1b6d24',
    accentFaded: '#1b6d2418',
    accentContainer: '#a0f399',
    tertiary: '#611a07',
    tertiaryFixed: '#ffdbd2',
    navBg: 'rgba(253,250,231,0.85)',
    // destination bento hero bg
    heroBg: '#004b87',
    // budget tip bg
    tipBg: 'rgba(27,109,36,0.06)',
    tipBorder: 'rgba(27,109,36,0.18)',
    tipSaveBg: 'rgba(27,109,36,0.12)',
    tipSaveColor: '#1b6d24',
    // travel tip card bg
    travelTipBg: '#ffffff',
    // next trip gradients
    grad1: 'linear-gradient(135deg,#003461,#004b87)',
    grad2: 'linear-gradient(135deg,#1b6d24,#005312)',
    grad3: 'linear-gradient(135deg,#611a07,#80301b)',
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
    accentContainer: '#4ae18320',
    tertiary: '#ffb4a1',
    tertiaryFixed: '#ffb4a120',
    navBg: 'rgba(10,10,10,0.80)',
    heroBg: '#0d1f35',
    tipBg: 'rgba(74,225,131,0.06)',
    tipBorder: 'rgba(74,225,131,0.18)',
    tipSaveBg: 'rgba(74,225,131,0.12)',
    tipSaveColor: '#4ae183',
    travelTipBg: '#1f1f1f',
    grad1: 'linear-gradient(135deg,#1a3a6b,#0d2545)',
    grad2: 'linear-gradient(135deg,#0d4a1a,#063010)',
    grad3: 'linear-gradient(135deg,#3b82f6,#6366f1)',
  },
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)

// ─── Component ────────────────────────────────────────────────────────────────
export default function Recommendations() {
  const { user } = useAuth()
  const { dark: ctxDark } = useTheme()

  const [isDark, setIsDark] = useState(ctxDark ?? false)
  useEffect(() => { if (ctxDark !== undefined) setIsDark(ctxDark) }, [ctxDark])
  const t = themes[isDark ? 'dark' : 'light']

  const [recs, setRecs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(new Set())

  useEffect(() => {
    api.get(`/api/recommendations/${user.id}`)
      .then(r => setRecs(r.data.recommendations))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user.id])

  const toggleSave = (key) => setSaved(s => {
    const n = new Set(s)
    n.has(key) ? n.delete(key) : n.add(key)
    return n
  })

  if (loading) return <Spinner />

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Lora:ital,wght@0,700;1,700&display=swap');
        * { box-sizing: border-box; }
        @keyframes rec-fade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .rec-hover { transition: transform 0.22s, box-shadow 0.22s; }
        .rec-hover:hover { transform: translateY(-4px); }
        .rec-img-card { overflow: hidden; }
        .rec-img-card img { transition: transform 0.7s ease; }
        .rec-img-card:hover img { transform: scale(1.06); }
        .rec-loc-icon { transition: background 0.18s, color 0.18s; }
        .rec-loc-row:hover .rec-loc-icon { background: var(--primary-hover-bg); color: white; }
        .rec-tip-row { transition: background 0.18s; }
        .rec-btn { transition: opacity 0.18s, transform 0.18s; cursor: pointer; }
        .rec-btn:hover { opacity: 0.85; transform: scale(1.02); }
      `}</style>

      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Manrope, sans-serif', transition: 'background 0.3s' }}>

        {/* dot-grid background — matches TripLogger */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `radial-gradient(${isDark ? 'rgba(163,201,255,0.07)' : 'rgba(0,52,97,0.06)'} 1px, transparent 1px)`,
          backgroundSize: '38px 38px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1080, margin: '0 auto', padding: '0 24px 100px' }}>

          {/* ── Nav ── */}
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

          </nav>

          {/* ── Header ── */}
          <header style={{ margin: '48px 0 40px', animation: 'rec-fade 0.45s ease both' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: t.accent, margin: '0 0 10px' }}>
              Curated For You
            </p>
            <h1 style={{
              fontSize: 'clamp(40px,6vw,68px)', fontWeight: 700,
              fontFamily: 'Lora, serif', fontStyle: 'italic',
              color: t.primary, letterSpacing: '-2px', lineHeight: 1,
              margin: '0 0 14px',
            }}>Recommendations</h1>
            <p style={{ fontSize: 16, color: t.textMuted, maxWidth: 560, lineHeight: 1.7, margin: 0 }}>
              Curated expeditions and hidden gems tailored to your travel personality. Your next narrative starts here.
            </p>
          </header>

          {!recs ? (
            <EmptyState icon="🧭" title="No recommendations yet" desc="Start logging your trips to get personalized destination and activity recommendations" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>

              {/* ── Recommended Destinations — Bento Grid ── */}
              {recs.destinations?.length > 0 && (
                <section style={{ animation: 'rec-fade 0.45s 0.08s ease both' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 14, fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', color: t.textPrimary, margin: 0 }}>
                      Recommended Destinations
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, margin: '0 20px' }}>
                      <div style={{ height: 1, background: t.border, flex: 1 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.primary, cursor: 'pointer' }}>
                      View All
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                    {/* Large hero card */}
                    {recs.destinations[0] && (
                      <div className="rec-hover rec-img-card" style={{
                        borderRadius: 20, overflow: 'hidden', position: 'relative',
                        minHeight: 380,
                        background: t.heroBg,
                        boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,52,97,0.15)',
                      }}>
                        {/* crosshatch texture */}
                        <div style={{
                          position: 'absolute', inset: 0,
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                          opacity: 0.8,
                        }} />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
                        }} />

                        {/* top badge + heart */}
                        <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
                            padding: '5px 12px', borderRadius: 999,
                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                            color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                          }}>{recs.destinations[0].category || 'Featured'}</span>
                          <button
                            onClick={() => toggleSave('dest-0')}
                            style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: saved.has('dest-0') ? '#ef4444' : '#fff',
                              cursor: 'pointer', transition: 'transform 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          ><HeartIcon filled={saved.has('dest-0')} /></button>
                        </div>

                        {/* bottom content */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px', zIndex: 2 }}>
                          <h3 style={{ fontSize: 32, fontWeight: 700, fontFamily: 'Lora, serif', color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
                            {recs.destinations[0].name}
                          </h3>
                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, margin: '0 0 20px', maxWidth: 400 }}>
                            {recs.destinations[0].description}
                          </p>
                          <button className="rec-btn" style={{
                            padding: '10px 24px', borderRadius: 10, border: 'none',
                            background: '#fff', color: t.primary,
                            fontSize: 12, fontWeight: 800, letterSpacing: '0.5px',
                            fontFamily: 'Manrope, sans-serif',
                          }}>Explore →</button>
                        </div>
                      </div>
                    )}

                    {/* Side card */}
                    {recs.destinations[1] && (
                      <div className="rec-hover" style={{
                        borderRadius: 20, padding: '28px',
                        background: isDark ? t.card : t.cardLow,
                        border: `2px solid ${t.accent}35`,
                        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(28,28,17,0.07)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        background: `linear-gradient(135deg, ${isDark ? 'rgba(74,225,131,0.06)' : 'rgba(27,109,36,0.04)'} 0%, ${isDark ? 'rgba(163,201,255,0.04)' : 'rgba(0,52,97,0.03)'} 100%)`,
                        border: `1.5px solid ${t.accent}30`,
                      }}>
                        <div>
                          <span style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
                            color: t.accent, padding: '4px 12px', borderRadius: 999,
                            background: t.accentFaded, border: `1px solid ${t.accent}25`,
                            display: 'inline-block', marginBottom: 20,
                          }}>{recs.destinations[1].category || 'Trending'}</span>
                          <h3 style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Lora, serif', fontStyle: 'italic', color: t.textPrimary, margin: '0 0 14px' }}>
                            {recs.destinations[1].name}
                          </h3>
                          <p style={{ fontSize: 13, color: t.textSecond, lineHeight: 1.7, margin: 0 }}>
                            {recs.destinations[1].description}
                          </p>
                        </div>
                        <div style={{ marginTop: 24, fontSize: 36 }}>✨</div>
                      </div>
                    )}
                  </div>

                  {/* remaining destinations as smaller cards */}
                  {recs.destinations.length > 2 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
                      {recs.destinations.slice(2).map((dest, i) => (
                        <div key={i} className="rec-hover" style={{
                          borderRadius: 16, overflow: 'hidden',
                          background: isDark ? t.card : t.cardLow,
                          border: `1px solid ${t.border}`,
                          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(28,28,17,0.06)',
                        }}>
                          <div style={{ height: 3, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' }} />
                          <div style={{ padding: '18px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                              <div>
                                <h3 style={{ fontSize: 15, fontWeight: 800, color: t.textPrimary, margin: '0 0 6px' }}>{dest.name}</h3>
                                <span style={{
                                  fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
                                  color: '#3b82f6', background: '#3b82f614', padding: '2px 8px', borderRadius: 999,
                                }}>{dest.category}</span>
                              </div>
                              <button onClick={() => toggleSave(`dest-${i + 2}`)} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: saved.has(`dest-${i + 2}`) ? '#ef4444' : t.textMuted,
                                transition: 'transform 0.2s',
                              }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                              ><HeartIcon filled={saved.has(`dest-${i + 2}`)} /></button>
                            </div>
                            <p style={{ fontSize: 13, color: t.textSecond, lineHeight: 1.6, margin: '0 0 14px' }}>{dest.description}</p>
                            <button className="rec-btn" style={{
                              width: '100%', padding: '9px', borderRadius: 10,
                              background: t.primaryFaded, border: `1px solid ${t.border}`,
                              color: t.primary, fontSize: 12, fontWeight: 700,
                              fontFamily: 'Manrope, sans-serif',
                            }}>Explore →</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ── Places to Visit + Travel Tips — 2 col ── */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 48, animation: 'rec-fade 0.45s 0.16s ease both',
              }}>

                {/* Places to Visit */}
                {recs.places?.length > 0 && (
                  <section>
                    <h2 style={{
                      fontSize: 22, fontWeight: 900, color: t.primary,
                      letterSpacing: '-0.5px', margin: '0 0 24px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      fontFamily: 'Manrope, sans-serif',
                      borderLeft: `4px solid ${t.primary}`,
                      paddingLeft: 14,
                    }}>Places to Visit</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {recs.places.map((place, i) => (
                        <div key={i} className="rec-tip-row" style={{
                          display: 'flex', gap: 18, alignItems: 'flex-start',
                          padding: '16px', borderRadius: 12,
                          transition: 'background 0.18s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = isDark ? t.cardHigh : t.cardHigh}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div className="rec-loc-icon" style={{
                            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                            background: t.primaryFaded,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: t.primary, transition: 'background 0.18s, color 0.18s',
                          }}>
                            <LocationIcon />
                          </div>
                          <div>
                            <h4 style={{ fontSize: 15, fontWeight: 800, color: t.primary, margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>
                              {place.name}
                            </h4>
                            {place.location && (
                              <p style={{ fontSize: 11, fontWeight: 700, color: t.accent, letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 6px' }}>
                                {place.location}
                              </p>
                            )}
                            <p style={{ fontSize: 13, color: t.textSecond, lineHeight: 1.6, margin: 0 }}>{place.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Travel Tips */}
                {recs.travel_tips?.length > 0 && (
                  <section>
                    <h2 style={{
                      fontSize: 22, fontWeight: 900, color: t.primary,
                      letterSpacing: '-0.5px', margin: '0 0 24px',
                      fontFamily: 'Manrope, sans-serif',
                      borderLeft: `4px solid ${t.accent}`,
                      paddingLeft: 14,
                    }}>Expert Insights</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {recs.travel_tips.map((tip, i) => (
                        <div key={i} className="rec-hover" style={{
                          background: t.travelTipBg,
                          border: `1px solid ${t.border}`,
                          borderRadius: 16, padding: '24px 20px',
                          textAlign: 'center',
                          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(28,28,17,0.05)',
                        }}>
                          <div style={{ fontSize: 36, marginBottom: 12 }}>{tip.icon}</div>
                          <h4 style={{ fontSize: 13, fontWeight: 800, color: t.textPrimary, margin: '0 0 8px', fontFamily: 'Manrope, sans-serif' }}>
                            {tip.title}
                          </h4>
                          <p style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.7, margin: 0 }}>{tip.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* ── Budget Optimization Tips ── */}
              {recs.budget_tips?.length > 0 && (
                <section style={{
                  background: isDark ? 'rgba(255,255,255,0.02)' : t.cardMid,
                  borderRadius: 24, padding: '40px',
                  border: `1px solid ${t.border}`,
                  animation: 'rec-fade 0.45s 0.24s ease both',
                }}>
                  <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h2 style={{
                      fontSize: 32, fontWeight: 700, fontFamily: 'Lora, serif',
                      color: t.primary, margin: '0 0 8px',
                    }}>Budget Optimization</h2>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: t.textMuted, margin: 0 }}>
                      Maximize your explorer's capital
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
                    {recs.budget_tips.map((tip, i) => (
                      <div key={i} className="rec-hover" style={{
                        borderRadius: 16, padding: '24px',
                        background: t.tipBg,
                        border: `1px solid ${t.tipBorder}`,
                        position: 'relative', overflow: 'hidden',
                      }}>
                        {/* decorative large icon bg */}
                        <div style={{
                          position: 'absolute', top: 8, right: 8,
                          fontSize: 56, opacity: 0.08, pointerEvents: 'none',
                        }}>💰</div>

                        <span style={{
                          display: 'inline-block', marginBottom: 16,
                          fontSize: 9, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
                          padding: '3px 10px', borderRadius: 999,
                          background: t.accent + '20', color: t.accent,
                          border: `1px solid ${t.accent}25`,
                        }}>{tip.category}</span>

                        <h4 style={{ fontSize: 15, fontWeight: 800, color: t.textPrimary, margin: '0 0 8px', fontFamily: 'Manrope, sans-serif' }}>
                          {tip.title || tip.tip?.slice(0, 40)}
                        </h4>
                        <p style={{ fontSize: 13, color: t.textSecond, lineHeight: 1.6, margin: '0 0 16px' }}>{tip.tip}</p>

                        {tip.savings && (
                          <span style={{
                            fontSize: 11, fontWeight: 800,
                            color: t.tipSaveColor, background: t.tipSaveBg,
                            padding: '4px 12px', borderRadius: 999,
                          }}>Save {tip.savings}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Your Next Adventure — gradient cards ── */}
              {recs.next_trip_suggestions?.length > 0 && (
                <section style={{ animation: 'rec-fade 0.45s 0.32s ease both' }}>
                  <h2 style={{
                    fontSize: 22, fontWeight: 900, color: t.primary,
                    letterSpacing: '-0.5px', margin: '0 0 24px', textAlign: 'center',
                    textTransform: 'uppercase', fontFamily: 'Manrope, sans-serif',
                  }}>Your Next Narrative</h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
                    {recs.next_trip_suggestions.map((s, i) => {
                      const grads = [t.grad1, t.grad2, t.grad3]
                      return (
                        <div key={i} className="rec-hover" style={{
                          borderRadius: 20, padding: '36px 28px',
                          background: grads[i % grads.length],
                          position: 'relative', overflow: 'hidden',
                          boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,52,97,0.15)',
                        }}>
                          {/* decorative blob */}
                          <div style={{
                            position: 'absolute', top: -30, right: -30,
                            width: 140, height: 140, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.06)',
                            pointerEvents: 'none',
                          }} />
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3 style={{
                              fontSize: 24, fontWeight: 700,
                              fontFamily: 'Lora, serif', fontStyle: 'italic',
                              color: '#fff', margin: '0 0 12px',
                            }}>{s.type}</h3>
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '0 0 8px', lineHeight: 1.6 }}>{s.suggestion}</p>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', margin: '0 0 24px', lineHeight: 1.6 }}>{s.reason}</p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                              {s.estimated_cost && (
                                <div>
                                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>Estimated Cost</p>
                                  <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'Lora, serif' }}>{s.estimated_cost}</p>
                                </div>
                              )}
                              <button className="rec-btn" style={{
                                padding: '10px 20px', borderRadius: 10, border: 'none',
                                background: 'rgba(255,255,255,0.18)',
                                backdropFilter: 'blur(8px)',
                                color: '#fff', fontSize: 12, fontWeight: 700,
                                fontFamily: 'Manrope, sans-serif',
                                marginLeft: 'auto',
                              }}>Plan This Trip →</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

            </div>
          )}
        </div>
      </div>
    </>
  )
}