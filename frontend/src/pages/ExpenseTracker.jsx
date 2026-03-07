import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { useTheme } from './ThemeContext'
import { PageHeader, Card, Btn, Input, Select, Modal, Badge, EmptyState, Spinner, StatCard, TripSelector, SectionTitle } from './UI'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>

const CAT_COLORS = { Transport: '#3b82f6', Food: '#ef4444', Stay: '#10b981', Activities: '#f59e0b', Shopping: '#8b5cf6', Other: '#6b7280' }
const CAT_ICONS = { Transport: '🚌', Food: '🍽️', Stay: '🏨', Activities: '🎯', Shopping: '🛍️', Other: '📦' }
const CATEGORIES = ['Transport', 'Food', 'Stay', 'Activities', 'Shopping', 'Other']

const defaultForm = { trip_id: '', category: 'Transport', amount: '', description: '' }

export default function ExpenseTracker() {
  const { t } = useTheme()
  const [expenses, setExpenses] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [summary, setSummary] = useState(null)
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

  useEffect(() => {
    if (selectedTrip) { fetchExpenses(); fetchSummary() }
  }, [selectedTrip])

  const fetchExpenses = async () => {
    setLoading(true)
    try { const r = await api.get(`/api/expenses/${selectedTrip}`); setExpenses(r.data.expenses) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }
  const fetchSummary = async () => {
    try { const r = await api.get(`/api/expenses/${selectedTrip}/summary`); setSummary(r.data) }
    catch (e) { console.error(e) }
  }

  const openNew = () => { setForm({ ...defaultForm, trip_id: selectedTrip }); setEditing(null); setShowForm(true) }
  const openEdit = (exp) => { setEditing(exp); setForm({ trip_id: exp.trip_id, category: exp.category, amount: exp.amount.toString(), description: exp.description || '' }); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...form, amount: parseFloat(form.amount) }
      if (editing) await api.put(`/api/expenses/${editing.id}`, data)
      else await api.post('/api/expenses', data)
      fetchExpenses(); fetchSummary(); closeForm()
    } catch (err) { console.error(err); alert('Error saving expense.') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    try { await api.delete(`/api/expenses/${id}`); fetchExpenses(); fetchSummary() }
    catch (e) { console.error(e) }
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) })

  const pieData = summary?.category_breakdown
    ? Object.entries(summary.category_breakdown).map(([name, value]) => ({ name, value: parseFloat(value), color: CAT_COLORS[name] || '#6b7280' }))
    : []

  return (
    <>
      <PageHeader
        title="Expense Tracker"
        subtitle="Track and analyze your travel spending"
        action={<Btn onClick={openNew} disabled={!selectedTrip}><PlusIcon /> Add Expense</Btn>}
      />

      <TripSelector trips={trips} value={selectedTrip} onChange={setSelectedTrip} />

      {selectedTrip && summary && (
        <>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 24 }}>
            <StatCard label="Total Expenses" value={`₹${summary.total_expenses?.toLocaleString()}`} icon="💸" gradient="linear-gradient(135deg,#3b82f6,#6366f1)" sub={`${summary.expense_count} entries`} />
            {Object.entries(summary.category_breakdown || {}).slice(0, 3).map(([cat, amt]) => (
              <StatCard key={cat} label={cat} value={`₹${parseFloat(amt).toLocaleString()}`} icon={CAT_ICONS[cat] || '📦'} gradient={`linear-gradient(135deg,${CAT_COLORS[cat]},${CAT_COLORS[cat]}88)`} />
            ))}
          </div>

          {/* Chart + breakdown */}
          {pieData.length > 0 && (
            <Card style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center' }}>
                <div style={{ flex: '0 0 220px' }}>
                  <SectionTitle>Distribution</SectionTitle>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <SectionTitle>Breakdown</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {pieData.map(item => {
                      const pct = Math.round((item.value / summary.total_expenses) * 100)
                      return (
                        <div key={item.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, color: t.textSecondary }}>{CAT_ICONS[item.name]} {item.name}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>₹{item.value.toLocaleString()} <span style={{ color: t.textMuted, fontWeight: 400 }}>({pct}%)</span></span>
                          </div>
                          <div style={{ height: 5, borderRadius: 3, background: t.dark ? '#1e2f4a' : '#e2e8f0' }}>
                            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: item.color, transition: 'width 0.6s ease' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Expense list */}
      {selectedTrip ? (
        loading ? <Spinner /> : expenses.length === 0 ? (
          <EmptyState icon="💸" title="No expenses yet" desc="Start tracking your trip spending" action={<Btn onClick={openNew}><PlusIcon /> Add First Expense</Btn>} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {expenses.map(exp => (
              <Card key={exp.id} hover>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: `${CAT_COLORS[exp.category] || '#6b7280'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {CAT_ICONS[exp.category] || '📦'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <Badge color={CAT_COLORS[exp.category] || '#6b7280'}>{exp.category}</Badge>
                      {exp.description && <span style={{ fontSize: 13, color: t.textSecondary }}>{exp.description}</span>}
                    </div>
                    <p style={{ fontSize: 11, color: t.textMuted }}>{new Date(exp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 12 }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: t.textPrimary, fontFamily: "'Playfair Display', serif" }}>₹{exp.amount?.toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(exp)} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${t.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textSecondary }}>
                      <EditIcon />
                    </button>
                    <button onClick={() => handleDelete(exp.id)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <EmptyState icon="🧾" title="Select a trip" desc="Choose a trip above to view and add expenses" />
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Expense' : 'Add Expense'} onClose={closeForm}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Select label="Trip" {...f('trip_id')} required>
              <option value="">Select a trip…</option>
              {trips.map(tr => <option key={tr.id} value={tr.id}>{tr.trip_name} — {tr.destination}</option>)}
            </Select>
            <Select label="Category" {...f('category')} required>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </Select>
            <Input label="Amount (₹)" type="number" {...f('amount')} required min="0" step="0.01" placeholder="500" />
            <Input label="Description" as="textarea" {...f('description')} placeholder="Flight tickets to Goa…" rows={2} />
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <Btn type="submit" style={{ flex: 1 }}>{editing ? 'Update' : 'Add'} Expense</Btn>
              <Btn variant="outline" onClick={closeForm} style={{ flex: 1 }}>Cancel</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}