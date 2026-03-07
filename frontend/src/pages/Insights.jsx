import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { useTheme } from './ThemeContext'
import { Card, Spinner, EmptyState, Badge, SectionTitle } from './UI'

const PERSONALITY_META = {
  'Budget Explorer': { emoji: '🎒', color: '#10b981', desc: "You love exploring the world while being smart with your money. Budget travel doesn't mean compromising on experiences!" },
  'Smart Traveler': { emoji: '🧠', color: '#3b82f6', desc: "You strike the perfect balance between comfort and cost. You know how to get the best value for your money." },
  'Comfort Seeker': { emoji: '🛋️', color: '#8b5cf6', desc: "You believe in traveling comfortably and are willing to invest in premium experiences." },
  'Luxury Traveler': { emoji: '💎', color: '#f59e0b', desc: "You spare no expense. Luxury, exclusivity, and premium experiences are your hallmark." },
  'New Traveler': { emoji: '🌱', color: '#6b7280', desc: "You're just beginning your travel journey. Every trip is a new adventure!" },
}

const PREF_ICONS = { Beach: '🏖️', Mountain: '⛰️', Cultural: '🏛️', City: '🏙️' }

export default function Insights() {
  const { user } = useAuth()
  const { t } = useTheme()
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
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: t.textPrimary, marginBottom: 4 }}>Travel Wrapped</h1>
        <p style={{ fontSize: 14, color: t.textSecondary }}>Your personalized travel insights for {new Date().getFullYear()}</p>
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
                borderRadius: 14, overflow: 'hidden',
                background: card.grad, padding: '22px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
                <p style={{ fontSize: 30, fontWeight: 700, color: 'white', fontFamily: "'Playfair Display', serif", letterSpacing: '-1px', marginBottom: 4 }}>{card.value}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Travel Personality hero */}
          <Card style={{ background: t.dark ? `${meta.color}10` : `${meta.color}08`, border: `1px solid ${meta.color}30`, textAlign: 'center', padding: '36px 28px' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>{meta.emoji}</div>
            <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Your Travel Personality</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: meta.color, marginBottom: 12 }}>{insights.travel_personality}</h2>
            <p style={{ fontSize: 15, color: t.textSecondary, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>{meta.desc}</p>
          </Card>

          {/* Preferences & Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Travel preference */}
            <Card>
              <SectionTitle>Travel Vibe</SectionTitle>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 52, marginBottom: 10 }}>{PREF_ICONS[insights.travel_preference?.split(' ')[0]] || '🗺️'}</div>
                <p style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary, fontFamily: "'Playfair Display', serif" }}>{insights.travel_preference || 'N/A'}</p>
                <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 4 }}>Your signature travel style</p>
              </div>
            </Card>

            {/* Quick stats */}
            <Card>
              <SectionTitle>Travel Stats</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Most Visited', value: insights.most_visited_destination || 'N/A' },
                  { label: 'Favorite Type', value: insights.favorite_place_category || 'N/A' },
                  { label: 'Avg Trip Cost', value: `₹${insights.average_trip_cost?.toLocaleString() || 0}` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: t.dark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                    <span style={{ fontSize: 13, color: t.textSecondary }}>{row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Budget Analysis */}
          {insights.budget_analysis && (
            <Card>
              <SectionTitle>Budget Analysis</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Total Budget', value: `₹${insights.budget_analysis.total_budget?.toLocaleString()}` },
                  { label: 'Actual Spending', value: `₹${insights.budget_analysis.total_spent?.toLocaleString()}` },
                  { label: 'Budget Utilization', value: `${insights.budget_analysis.budget_utilization}%` },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center', padding: '16px', borderRadius: 12, background: t.dark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                    <p style={{ fontSize: 12, color: t.textSecondary, marginBottom: 6 }}>{item.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary, fontFamily: "'Playfair Display', serif" }}>{item.value}</p>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: t.textSecondary }}>Budget used</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: insights.budget_analysis.budget_utilization > 100 ? '#ef4444' : '#10b981' }}>
                    {insights.budget_analysis.budget_utilization}%
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: t.dark ? '#1e2f4a' : '#e2e8f0' }}>
                  <div style={{ height: '100%', borderRadius: 4, width: `${Math.min(insights.budget_analysis.budget_utilization, 100)}%`, background: insights.budget_analysis.budget_utilization > 100 ? '#ef4444' : 'linear-gradient(90deg,#3b82f6,#10b981)', transition: 'width 0.8s ease' }} />
                </div>
              </div>
              {insights.budget_analysis.overspend > 0 && (
                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13, color: '#ef4444' }}>
                  ⚠️ Overspent by ₹{insights.budget_analysis.overspend?.toLocaleString()}
                </div>
              )}
            </Card>
          )}

          {/* Destination Breakdown */}
          {insights.destination_breakdown && Object.keys(insights.destination_breakdown).length > 0 && (
            <Card>
              <SectionTitle>Destinations Visited</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
                {Object.entries(insights.destination_breakdown).map(([dest, count]) => (
                  <div key={dest} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: t.dark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                    <span style={{ fontSize: 13, color: t.textSecondary }}>📍 {dest}</span>
                    <Badge color="#3b82f6">{count} trip{count > 1 ? 's' : ''}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      )}
    </div>
  )
}