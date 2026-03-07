import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { PageHeader, Card, Btn, Input, Select, Modal, Badge, EmptyState, Spinner, TripSelector } from '../design/UI'

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
const MoonIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>

const defaultForm = { trip_id: '', hotel_name: '', cost_per_night: '', nights: '' }

export default function HotelLogger() {
  const { t } = useTheme()
  const [hotels, setHotels] = useState([])
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

  useEffect(() => { if (selectedTrip) fetchHotels() }, [selectedTrip])

  const fetchHotels = async () => {
    setLoading(true)
    try { const r = await api.get(`/api/hotels/${selectedTrip}`); setHotels(r.data.hotels) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const openNew = () => { setForm({ ...defaultForm, trip_id: selectedTrip }); setEditing(null); setShowForm(true) }
  const openEdit = (h) => { setEditing(h); setForm({ trip_id: h.trip_id, hotel_name: h.hotel_name, cost_per_night: h.cost_per_night.toString(), nights: h.nights.toString() }); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...form, cost_per_night: parseFloat(form.cost_per_night), nights: parseInt(form.nights) }
      if (editing) await api.put(`/api/hotels/${editing.id}`, data)
      else await api.post('/api/hotels', data)
      fetchHotels(); closeForm()
    } catch (err) { console.error(err); alert('Error saving hotel.') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hotel?')) return
    try { await api.delete(`/api/hotels/${id}`); fetchHotels() }
    catch (e) { console.error(e) }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) })
  const totalCost = (parseFloat(form.cost_per_night) || 0) * (parseInt(form.nights) || 0)

  const totalAccommodation = hotels.reduce((sum, h) => sum + (h.total_cost || 0), 0)

  return (
    <>
      <PageHeader
        title="Hotel Logger"
        subtitle="Track your accommodation details and costs"
        action={<Btn onClick={openNew} disabled={!selectedTrip}><PlusIcon /> Add Hotel</Btn>}
      />

      <TripSelector trips={trips} value={selectedTrip} onChange={setSelectedTrip} />

      {selectedTrip && hotels.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 24 }}>
          <div style={{ background: t.card, borderRadius: 14, padding: '18px 20px', border: `1px solid ${t.border}` }}>
            <p style={{ fontSize: 12, color: t.textSecondary, marginBottom: 4 }}>Total Accommodation</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: t.textPrimary, fontFamily: "'Playfair Display', serif" }}>₹{totalAccommodation.toLocaleString()}</p>
          </div>
          <div style={{ background: t.card, borderRadius: 14, padding: '18px 20px', border: `1px solid ${t.border}` }}>
            <p style={{ fontSize: 12, color: t.textSecondary, marginBottom: 4 }}>Hotels Logged</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: t.textPrimary, fontFamily: "'Playfair Display', serif" }}>{hotels.length}</p>
          </div>
          <div style={{ background: t.card, borderRadius: 14, padding: '18px 20px', border: `1px solid ${t.border}` }}>
            <p style={{ fontSize: 12, color: t.textSecondary, marginBottom: 4 }}>Total Nights</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: t.textPrimary, fontFamily: "'Playfair Display', serif" }}>
              {hotels.reduce((sum, h) => sum + h.nights, 0)}
            </p>
          </div>
        </div>
      )}

      {selectedTrip ? (
        loading ? <Spinner /> : hotels.length === 0 ? (
          <EmptyState icon="🏨" title="No hotels logged" desc="Add your accommodation details for this trip" action={<Btn onClick={openNew}><PlusIcon /> Add First Hotel</Btn>} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {hotels.map(hotel => (
              <Card key={hotel.id} hover>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Icon */}
                  <div style={{ width: 50, height: 50, borderRadius: 13, background: 'linear-gradient(135deg,#f97316,#fb923c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 4px 12px rgba(249,115,22,0.25)' }}>🏨</div>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{hotel.hotel_name}</h3>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: t.textSecondary }}>
                        💰 ₹{hotel.cost_per_night?.toLocaleString()} / night
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: t.textSecondary }}>
                        <MoonIcon /> {hotel.nights} night{hotel.nights > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Total cost */}
                  <div style={{ textAlign: 'right', marginRight: 12 }}>
                    <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 2 }}>Total</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#f97316', fontFamily: "'Playfair Display', serif" }}>₹{hotel.total_cost?.toLocaleString()}</p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(hotel)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textSecondary }}>
                      <EditIcon />
                    </button>
                    <button onClick={() => handleDelete(hotel.id)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <EmptyState icon="🏨" title="Select a trip" desc="Choose a trip to view and add hotels" />
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Hotel' : 'Add Hotel'} onClose={closeForm}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Select label="Trip" {...f('trip_id')} required>
              <option value="">Select a trip…</option>
              {trips.map(tr => <option key={tr.id} value={tr.id}>{tr.trip_name} — {tr.destination}</option>)}
            </Select>
            <Input label="Hotel Name" {...f('hotel_name')} required placeholder="Taj Resort & Convention Centre" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Cost per Night (₹)" type="number" {...f('cost_per_night')} required min="0" step="0.01" placeholder="8000" />
              <Input label="Number of Nights" type="number" {...f('nights')} required min="1" placeholder="4" />
            </div>
            {totalCost > 0 && (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#f97316', fontWeight: 600 }}>Total Cost</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#f97316', fontFamily: "'Playfair Display', serif" }}>₹{totalCost.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <Btn type="submit" style={{ flex: 1 }}>{editing ? 'Update' : 'Add'} Hotel</Btn>
              <Btn variant="outline" onClick={closeForm} style={{ flex: 1 }}>Cancel</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}