import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { PageHeader, Card, Btn, Input, Select, Modal, Badge, EmptyState, Spinner, TripSelector } from '../design/UI'

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
const StarFill = ({ filled }) => <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>

const CAT_COLORS = { Beach: '#3b82f6', Fort: '#78716c', Museum: '#8b5cf6', Temple: '#f97316', Mountain: '#10b981', Park: '#22c55e', Restaurant: '#ef4444', Shopping: '#ec4899', Entertainment: '#a855f7', Historical: '#f59e0b', Other: '#6b7280' }
const CAT_ICONS = { Beach: '🏖️', Fort: '🏰', Museum: '🏛️', Temple: '🛕', Mountain: '⛰️', Park: '🌳', Restaurant: '🍽️', Shopping: '🛍️', Entertainment: '🎭', Historical: '🏺', Other: '📍' }
const CATEGORIES = ['Beach', 'Fort', 'Museum', 'Temple', 'Mountain', 'Park', 'Restaurant', 'Shopping', 'Entertainment', 'Historical', 'Other']

const defaultForm = { trip_id: '', place_name: '', category: 'Beach', rating: '', notes: '' }

const StarRating = ({ value, onChange }) => {
  const num = parseFloat(value) || 0
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange({ target: { value: s.toString() } })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
          <StarFill filled={s <= num} />
        </button>
      ))}
      {num > 0 && <span style={{ fontSize: 12, color: '#f59e0b', marginLeft: 4 }}>{num}/5</span>}
    </div>
  )
}

export default function PlacesLogger() {
  const { t } = useTheme()
  const [places, setPlaces] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)

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

  return (
    <>
      <PageHeader
        title="Places Logger"
        subtitle="Track every spot you visit on your travels"
        action={<Btn onClick={openNew} disabled={!selectedTrip}><PlusIcon /> Add Place</Btn>}
      />

      <TripSelector trips={trips} value={selectedTrip} onChange={setSelectedTrip} />

      {selectedTrip ? (
        loading ? <Spinner /> : places.length === 0 ? (
          <EmptyState icon="📍" title="No places logged" desc="Start adding memorable spots from this trip" action={<Btn onClick={openNew}><PlusIcon /> Add First Place</Btn>} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
            {places.map(place => {
              const color = CAT_COLORS[place.category] || '#6b7280'
              const icon = CAT_ICONS[place.category] || '📍'
              return (
                <Card key={place.id} hover style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 3, background: `linear-gradient(90deg,${color},${color}66)` }} />
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                          {icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: t.textPrimary, marginBottom: 5, fontFamily: "'DM Sans', sans-serif" }}>{place.place_name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <Badge color={color}>{place.category}</Badge>
                            {place.rating && (
                              <div style={{ display: 'flex', gap: 2 }}>
                                {[1, 2, 3, 4, 5].map(s => <StarFill key={s} filled={s <= place.rating} />)}
                              </div>
                            )}
                          </div>
                          {place.notes && <p style={{ fontSize: 12, color: t.textSecondary, marginTop: 8, lineHeight: 1.5 }}>{place.notes}</p>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexShrink: 0, marginLeft: 8 }}>
                        <button onClick={() => openEdit(place)} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${t.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textSecondary }}>
                          <EditIcon />
                        </button>
                        <button onClick={() => handleDelete(place.id)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      ) : (
        <EmptyState icon="🗺️" title="Select a trip" desc="Choose a trip to view and log places" />
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Place' : 'Add Place'} onClose={closeForm}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Select label="Trip" {...f('trip_id')} required>
              <option value="">Select a trip…</option>
              {trips.map(tr => <option key={tr.id} value={tr.id}>{tr.trip_name} — {tr.destination}</option>)}
            </Select>
            <Input label="Place Name" {...f('place_name')} required placeholder="Taj Mahal" />
            <Select label="Category" {...f('category')} required>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </Select>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, letterSpacing: '0.3px', display: 'block', marginBottom: 6 }}>Rating</label>
              <StarRating value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
            </div>
            <Input label="Notes" as="textarea" {...f('notes')} placeholder="Beautiful architecture with amazing views…" rows={3} />
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <Btn type="submit" style={{ flex: 1 }}>{editing ? 'Update' : 'Add'} Place</Btn>
              <Btn variant="outline" onClick={closeForm} style={{ flex: 1 }}>Cancel</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}