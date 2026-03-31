import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { Card, Spinner, EmptyState, Badge, SectionTitle } from '../design/UI'
import { useNavigate } from 'react-router-dom'

const PERSONALITY_META = {
  'Budget Explorer': { emoji: '🎒', color: '#10b981', desc: "You love exploring the world while being smart with your money. Budget travel doesn't mean compromising on experiences!" },
  'Smart Traveler': { emoji: '🧠', color: '#3b82f6', desc: "You strike the perfect balance between comfort and cost. You know how to get the best value for your money." },
  'Comfort Seeker': { emoji: '🛋️', color: '#8b5cf6', desc: "You believe in traveling comfortably and are willing to invest in premium experiences." },
  'Luxury Traveler': { emoji: '💎', color: '#f59e0b', desc: "You spare no expense. Luxury, exclusivity, and premium experiences are your hallmark." },
  'New Traveler': { emoji: '🌱', color: '#6b7280', desc: "You're just beginning your travel journey. Every trip is a new adventure!" },
}

const PREF_ICONS = {
  'Beach': '🏖️',
  'Beach Lover': '🏖️',
  'Mountain': '⛰️',
  'Mountain Explorer': '⛰️',
  'Cultural': '🏛️',
  'Cultural Explorer': '🏛️',
  'City': '🏙️',
  'City Explorer': '🏙️',
  'Explorer': '🗺️',
}

function getPrefIcon(pref) {
  if (!pref) return '🗺️'
  // Try exact match first
  if (PREF_ICONS[pref]) return PREF_ICONS[pref]
  // Try first word
  const firstWord = pref.split(' ')[0]
  if (PREF_ICONS[firstWord]) return PREF_ICONS[firstWord]
  return '🗺️'
}

export default function Insights() {
  const { user } = useAuth()
  const { t } = useTheme()
  const navigate = useNavigate()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/insights/${user.id}`)
      .then(r => setInsights(r.data.insights))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const meta = PERSONALITY_META[insights?.travel_personality] || PERSONALITY_META['New Traveler']

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: t.textPrimary, marginBottom: 4 }}>
            Travel Wrapped ✨
          </h1>
          <p style={{ fontSize: 14, color: t.textSecondary }}>Your personalized travel insights for {new Date().getFullYear()}</p>
        </div>

        {/* Analytics Button */}
        <button
          onClick={() => navigate('/analytics')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 12, border: 'none',
            cursor: 'pointer', fontSize: 14, fontWeight: 600,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: 'white',
            boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          📊 View Analytics
        </button>
      </div>

      {!insights || insights.total_trips === 0 ? (
        <EmptyState icon="🗺️" title="No travel data yet" desc="Start logging your trips to unlock your personalized travel insights and yearly wrapped" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Top stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
            {[
              { label: 'Total Trips', value: insights.total_trips, icon: '✈️', grad: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
              { label: 'Total Spent', value: `₹${(insights.total_spent / 1000).toFixed(0)}K`, icon: '💸', grad: 'linear-gradient(135deg,#10b981,#059669)' },
              { label: 'Places Explored', value: insights.countries_visited, icon: '📍', grad: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
              { label: 'Trips per Year', value: insights.travel_frequency, icon: '📅', grad: 'linear-gradient(135deg,#f97316,#ea580c)' },
            ].map(card => (
              <div key={card.label} style={{
                borderRadius: 16, background: card.grad, padding: '22px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
                <p style={{ fontSize: 30, fontWeight: 700, color: 'white', fontFamily: "'Playfair Display', serif", letterSpacing: '-1px', marginBottom: 4 }}>{card.value}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Travel Personality hero */}
          <div style={{
            borderRadius: 20,
            background: `linear-gradient(135deg, ${meta.color}22, ${meta.color}08)`,
            border: `1.5px solid ${meta.color}40`,
            textAlign: 'center',
            padding: '40px 28px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* decorative background circle */}
            <div style={{
              position: 'absolute', top: -40, right: -40,
              width: 180, height: 180, borderRadius: '50%',
              background: `${meta.color}15`,
            }} />
            <div style={{ fontSize: 60, marginBottom: 14 }}>{meta.emoji}</div>
            <p style={{ fontSize: 12, color: meta.color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Your Travel Personality</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: meta.color, marginBottom: 12 }}>{insights.travel_personality}</h2>
            <p style={{ fontSize: 15, color: t.textSecondary, maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>{meta.desc}</p>
          </div>

          {/* Preferences & Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Travel preference */}
            <div style={{
              borderRadius: 16, padding: 24,
              background: t.dark ? 'rgba(255,255,255,0.04)' : 'white',
              border: `1px solid ${t.dark ? 'rgba(255,255,255,0.08)' : '#e8f0fe'}`,
              boxShadow: t.dark ? 'none' : '0 4px 20px rgba(59,130,246,0.08)',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Travel Vibe</p>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  fontSize: 52, marginBottom: 12,
                  background: 'linear-gradient(135deg,#3b82f620,#6366f120)',
                  borderRadius: '50%', width: 88, height: 88,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  {getPrefIcon(insights.travel_preference)}
                </div>
                <p style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary, fontFamily: "'Playfair Display', serif" }}>
                  {insights.travel_preference || 'Explorer'}
                </p>
                <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 6 }}>Your signature travel style</p>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{
              borderRadius: 16, padding: 24,
              background: t.dark ? 'rgba(255,255,255,0.04)' : 'white',
              border: `1px solid ${t.dark ? 'rgba(255,255,255,0.08)' : '#e8f0fe'}`,
              boxShadow: t.dark ? 'none' : '0 4px 20px rgba(59,130,246,0.08)',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Travel Stats</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Most Visited', value: insights.most_visited_destination || 'N/A', icon: '📍' },
                  { label: 'Favorite Type', value: insights.favorite_place_category || 'N/A', icon: '🏆' },
                  { label: 'Avg Trip Cost', value: `₹${insights.average_trip_cost?.toLocaleString() || 0}`, icon: '💰' },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px', borderRadius: 12,
                    background: t.dark ? 'rgba(255,255,255,0.04)' : '#f0f7ff',
                  }}>
                    <span style={{ fontSize: 13, color: t.textSecondary }}>{row.icon} {row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Analysis */}
          {insights.budget_analysis && (
            <div style={{
              borderRadius: 16, padding: 24,
              background: t.dark ? 'rgba(255,255,255,0.04)' : 'white',
              border: `1px solid ${t.dark ? 'rgba(255,255,255,0.08)' : '#e8f0fe'}`,
              boxShadow: t.dark ? 'none' : '0 4px 20px rgba(59,130,246,0.08)',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Budget Analysis</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Budget', value: `₹${insights.budget_analysis.total_budget?.toLocaleString()}`, color: '#3b82f6' },
                  { label: 'Actual Spending', value: `₹${insights.budget_analysis.total_spent?.toLocaleString()}`, color: '#10b981' },
                  { label: 'Budget Used', value: `${insights.budget_analysis.budget_utilization}%`, color: insights.budget_analysis.budget_utilization > 100 ? '#ef4444' : '#f59e0b' },
                ].map(item => (
                  <div key={item.label} style={{
                    textAlign: 'center', padding: '18px 12px', borderRadius: 14,
                    background: `${item.color}12`,
                    border: `1px solid ${item.color}25`,
                  }}>
                    <p style={{ fontSize: 12, color: t.textSecondary, marginBottom: 8 }}>{item.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: item.color, fontFamily: "'Playfair Display', serif" }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: t.textSecondary }}>Budget used</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: insights.budget_analysis.budget_utilization > 100 ? '#ef4444' : '#10b981' }}>
                    {insights.budget_analysis.budget_utilization}%
                  </span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: t.dark ? '#1e2f4a' : '#e2e8f0' }}>
                  <div style={{
                    height: '100%', borderRadius: 5,
                    width: `${Math.min(insights.budget_analysis.budget_utilization, 100)}%`,
                    background: insights.budget_analysis.budget_utilization > 100
                      ? '#ef4444'
                      : 'linear-gradient(90deg,#3b82f6,#10b981)',
                    transition: 'width 1s ease',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
                  }} />
                </div>
              </div>
              {insights.budget_analysis.overspend > 0 && (
                <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13, color: '#ef4444' }}>
                  ⚠️ Overspent by ₹{insights.budget_analysis.overspend?.toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Destination Breakdown */}
          {insights.destination_breakdown && Object.keys(insights.destination_breakdown).length > 0 && (
            <div style={{
              borderRadius: 16, padding: 24,
              background: t.dark ? 'rgba(255,255,255,0.04)' : 'white',
              border: `1px solid ${t.dark ? 'rgba(255,255,255,0.08)' : '#e8f0fe'}`,
              boxShadow: t.dark ? 'none' : '0 4px 20px rgba(59,130,246,0.08)',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Destinations Visited</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
                {Object.entries(insights.destination_breakdown).map(([dest, count], i) => {
                  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#06b6d4', '#f59e0b']
                  const c = colors[i % colors.length]
                  return (
                    <div key={dest} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px', borderRadius: 12,
                      background: `${c}10`, border: `1px solid ${c}25`,
                    }}>
                      <span style={{ fontSize: 13, color: t.textPrimary, fontWeight: 500 }}>📍 {dest}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: c, background: `${c}20`, padding: '3px 10px', borderRadius: 20 }}>
                        {count} trip{count > 1 ? 's' : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bottom CTA to Analytics */}
          <div style={{
            borderRadius: 16, padding: '28px 24px',
            background: 'linear-gradient(135deg, #3b82f615, #6366f115)',
            border: '1px solid #3b82f630',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 4 }}>Want deeper insights?</p>
              <p style={{ fontSize: 13, color: t.textSecondary }}>View charts, spending trends, behaviour analysis and more</p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              style={{
                padding: '12px 24px', borderRadius: 12, border: 'none',
                cursor: 'pointer', fontSize: 14, fontWeight: 600,
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: 'white', whiteSpace: 'nowrap',
                boxShadow: '0 4px 15px rgba(99,102,241,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              📊 Open Analytics →
            </button>
          </div>

        </div>
      )}
    </div>
  )
}