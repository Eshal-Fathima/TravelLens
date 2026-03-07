import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { useTheme } from './ThemeContext'
import { PageHeader, Card, Btn, Input, Select, Modal, Badge, EmptyState, Spinner } from './UI'

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
const CalIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
const PinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
const WalletIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" /></svg>
const UsersIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>

const travelTypeColors = { Solo: '#3b82f6', Family: '#10b981', Friends: '#f97316' }

const defaultForm = { trip_name: '', destination: '', start_date: '', end_date: '', budget: '', travel_type: 'Solo' }

export default function TripLogger() {
  const { t } = useTheme()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => { fetchTrips() }, [])

  const fetchTrips = async () => {
    try {
      const r = await api.get('/api/trips')
      setTrips(r.data.trips)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const openNew = () => { setForm(defaultForm); setEditing(null); setShowForm(true) }
  const openEdit = (trip) => {
    setEditing(trip)
    setForm({ trip_name: trip.trip_name, destination: trip.destination, start_date: trip.start_date?.split('T')[0] || '', end_date: trip.end_date?.split('T')[0] || '', budget: trip.budget?.toString() || '', travel_type: trip.travel_type })
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form, budget: parseFloat(form.budget) }
    if (isNaN(data.budget) || data.budget <= 0) { alert('Enter a valid budget'); return }
    try {
      if (editing) await api.put(`/api/trips/${editing.id}`, data)
      else await api.post('/api/trips', data)
      fetchTrips(); closeForm()
    } catch (err) { console.error(err); alert('Error saving trip.') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip?')) return
    try { await api.delete(`/api/trips/${id}`); fetchTrips() }
    catch (e) { console.error(e) }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) })

  const getDuration = (start, end) => {
    const d = Math.ceil((new Date(end) - new Date(start)) / 86400000)
    return d > 0 ? `${d} day${d > 1 ? 's' : ''}` : null
  }

  return (
    <>
      <PageHeader
        title="Trip Logger"
        subtitle="Manage and track all your travel adventures"
        action={<Btn onClick={openNew}><PlusIcon /> New Trip</Btn>}
      />

      {loading ? <Spinner /> : trips.length === 0 ? (
        <EmptyState icon="✈️" title="No trips yet" desc="Create your first trip to start your travel journal" action={<Btn onClick={openNew}><PlusIcon /> Create First Trip</Btn>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {trips.map(trip => {
            const duration = getDuration(trip.start_date, trip.end_date)
            const color = travelTypeColors[trip.travel_type] || '#3b82f6'
            return (
              <Card key={trip.id} hover style={{ padding: 0, overflow: 'hidden' }}>
                {/* Color bar */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                <div style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{trip.trip_name}</h3>
                      <Badge color={color}>{trip.travel_type}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(trip)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textSecondary, transition: 'all 0.18s' }}>
                        <EditIcon />
                      </button>
                      <button onClick={() => handleDelete(trip.id)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', transition: 'all 0.18s' }}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: t.textSecondary }}>
                      <PinIcon />{trip.destination}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: t.textSecondary }}>
                      <CalIcon />
                      {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {duration && <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: `${color}15`, color }}>{duration}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: t.textSecondary }}>
                      <WalletIcon />Budget: <strong style={{ color: t.textPrimary }}>₹{trip.budget?.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Trip' : 'New Trip'} onClose={closeForm}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Trip Name" {...f('trip_name')} required placeholder="Summer Vacation 2025" />
            <Input label="Destination" {...f('destination')} required placeholder="Goa, India" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Start Date" type="date" {...f('start_date')} required />
              <Input label="End Date" type="date" {...f('end_date')} required min={form.start_date} />
            </div>
            <Input label="Budget (₹)" type="number" {...f('budget')} required min="0" step="0.01" placeholder="25000" />
            <Select label="Travel Type" {...f('travel_type')} required>
              {['Solo', 'Family', 'Friends'].map(v => <option key={v} value={v}>{v}</option>)}
            </Select>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <Btn type="submit" style={{ flex: 1 }}>{editing ? 'Update Trip' : 'Create Trip'}</Btn>
              <Btn variant="outline" onClick={closeForm} style={{ flex: 1 }}>Cancel</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}