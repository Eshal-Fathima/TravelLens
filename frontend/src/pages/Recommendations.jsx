import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { Card, Spinner, EmptyState, Badge, SectionTitle, Btn } from '../design/UI'

export default function Recommendations() {
  const { user } = useAuth()
  const { t } = useTheme()
  const [recs, setRecs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(new Set())

  useEffect(() => {
    api.get(`/api/recommendations/${user.id}`)
      .then(r => setRecs(r.data.recommendations))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleSave = (key) => setSaved(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n })

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: t.textPrimary, marginBottom: 4 }}>Recommendations</h1>
        <p style={{ fontSize: 14, color: t.textSecondary }}>Personalized suggestions based on your travel history</p>
      </div>

      {!recs ? (
        <EmptyState icon="🧭" title="No recommendations yet" desc="Start logging your trips to get personalized destination and activity recommendations" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Destinations */}
          {recs.destinations?.length > 0 && (
            <section>
              <SectionTitle>🌍 Recommended Destinations</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                {recs.destinations.map((dest, i) => (
                  <Card key={i} hover style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ height: 3, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' }} />
                    <div style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, fontFamily: "'DM Sans', sans-serif", marginBottom: 5 }}>{dest.name}</h3>
                          <Badge color="#3b82f6">{dest.category}</Badge>
                        </div>
                        <button onClick={() => toggleSave(`dest-${i}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, transition: 'transform 0.2s' }}>
                          {saved.has(`dest-${i}`) ? '❤️' : '🤍'}
                        </button>
                      </div>
                      <p style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.5, marginBottom: 14 }}>{dest.description}</p>
                      <Btn variant="ghost" small style={{ width: '100%' }}>Explore →</Btn>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Places to visit */}
          {recs.places?.length > 0 && (
            <section>
              <SectionTitle>📍 Places to Visit</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
                {recs.places.map((place, i) => (
                  <Card key={i} hover>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📍</div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary, fontFamily: "'DM Sans', sans-serif", marginBottom: 3 }}>{place.name}</h3>
                        <p style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, marginBottom: 6 }}>{place.location}</p>
                        <p style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.5 }}>{place.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Budget tips */}
          {recs.budget_tips?.length > 0 && (
            <section>
              <SectionTitle>💡 Budget Optimization Tips</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
                {recs.budget_tips.map((tip, i) => (
                  <div key={i} style={{
                    borderRadius: 14, padding: '18px 20px',
                    background: t.dark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
                    border: '1px solid rgba(16,185,129,0.2)',
                  }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>💰</div>
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                          <Badge color="#10b981">{tip.category}</Badge>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>Save {tip.savings}</span>
                        </div>
                        <p style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.5 }}>{tip.tip}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Travel tips */}
          {recs.travel_tips?.length > 0 && (
            <section>
              <SectionTitle>🧠 Travel Tips for You</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
                {recs.travel_tips.map((tip, i) => (
                  <Card key={i} hover style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{tip.icon}</div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{tip.title}</h3>
                    <p style={{ fontSize: 12, color: t.textSecondary, lineHeight: 1.6 }}>{tip.description}</p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Next trip suggestions */}
          {recs.next_trip_suggestions?.length > 0 && (
            <section>
              <SectionTitle>🚀 Your Next Adventure</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                {recs.next_trip_suggestions.map((s, i) => {
                  const grads = ['linear-gradient(135deg,#3b82f6,#6366f1)', 'linear-gradient(135deg,#f97316,#ea580c)', 'linear-gradient(135deg,#8b5cf6,#7c3aed)']
                  return (
                    <div key={i} style={{ borderRadius: 14, padding: '22px', background: grads[i % grads.length], position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>{s.type}</h3>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6, lineHeight: 1.5 }}>{s.suggestion}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', marginBottom: 16 }}>{s.reason}</p>
                      <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)', fontFamily: "'DM Sans', sans-serif" }}>
                        Plan This Trip →
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  )
}