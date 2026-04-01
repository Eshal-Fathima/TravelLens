import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { Card, Spinner, EmptyState, SectionTitle } from '../design/Ui'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

const StatCard = ({ icon, label, value, grad }) => (
    <div style={{
        borderRadius: 14, background: grad, padding: '20px 22px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    }}>
        <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'white', fontFamily: "'Playfair Display', serif", letterSpacing: '-0.5px', marginBottom: 4 }}>{value}</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
    </div>
)

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px' }}>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ fontSize: 14, fontWeight: 600, color: p.color || '#fff' }}>
                        {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default function Analytics() {
    const { user } = useAuth()
    const { t } = useTheme()
    const [overview, setOverview] = useState(null)
    const [charts, setCharts] = useState(null)
    const [behaviour, setBehaviour] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        const uid = user.id
        Promise.all([
            api.get(`/api/analytics/overview/${uid}`),
            api.get(`/api/analytics/charts/${uid}`),
            api.get(`/api/analytics/behaviour/${uid}`)
        ]).then(([ov, ch, bh]) => {
            setOverview(ov.data.overview)
            setCharts(ch.data.charts)
            setBehaviour(bh.data.behaviour)
        }).catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <Spinner />

    const noData = !overview || overview.total_trips === 0

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'spending', label: '💸 Spending' },
        { id: 'travel', label: '✈️ Travel' },
        { id: 'behaviour', label: '👤 Behaviour' },
    ]

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: t.textPrimary, marginBottom: 4 }}>
                    Travel Analytics
                </h1>
                <p style={{ fontSize: 14, color: t.textSecondary }}>Deep insights into your travel patterns and spending</p>
            </div>

            {noData ? (
                <EmptyState icon="📊" title="No analytics yet" desc="Start logging trips to unlock your travel analytics dashboard" />
            ) : (
                <>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
                                    fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                                    background: activeTab === tab.id
                                        ? 'linear-gradient(135deg,#3b82f6,#6366f1)'
                                        : t.dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                                    color: activeTab === tab.id ? 'white' : t.textSecondary,
                                    boxShadow: activeTab === tab.id ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Stat cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
                                <StatCard icon="✈️" label="Total Trips" value={overview.total_trips} grad="linear-gradient(135deg,#3b82f6,#6366f1)" />
                                <StatCard icon="💸" label="Total Spent" value={`₹${(overview.total_spent / 1000).toFixed(1)}K`} grad="linear-gradient(135deg,#10b981,#059669)" />
                                <StatCard icon="📍" label="Destinations" value={overview.total_destinations} grad="linear-gradient(135deg,#8b5cf6,#7c3aed)" />
                                <StatCard icon="🏛️" label="Places Visited" value={overview.total_places} grad="linear-gradient(135deg,#f97316,#ea580c)" />
                                <StatCard icon="📅" label="Avg Duration" value={`${overview.avg_trip_duration}d`} grad="linear-gradient(135deg,#06b6d4,#0284c7)" />
                                <StatCard icon="💰" label="Avg Trip Cost" value={`₹${(overview.avg_trip_cost / 1000).toFixed(1)}K`} grad="linear-gradient(135deg,#f59e0b,#d97706)" />
                            </div>

                            {/* Trips per month */}
                            {charts?.trips_per_month?.length > 0 && (
                                <Card>
                                    <SectionTitle>Trips Per Month</SectionTitle>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={charts.trips_per_month} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={t.dark ? '#1e2f4a' : '#e2e8f0'} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: t.textSecondary }} />
                                            <YAxis tick={{ fontSize: 11, fill: t.textSecondary }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="trips" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* SPENDING TAB */}
                    {activeTab === 'spending' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {/* Expense by category pie */}
                                {charts?.expense_by_category?.length > 0 && (
                                    <Card>
                                        <SectionTitle>Expense Breakdown</SectionTitle>
                                        <ResponsiveContainer width="100%" height={260}>
                                            <PieChart>
                                                <Pie data={charts.expense_by_category} dataKey="value" nameKey="name"
                                                    cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                                                    {charts.expense_by_category.map((_, i) => (
                                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                                                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Card>
                                )}

                                {/* Spending trend line */}
                                {behaviour?.spending_trend?.length > 0 && (
                                    <Card>
                                        <SectionTitle>Spending Trend</SectionTitle>
                                        <ResponsiveContainer width="100%" height={260}>
                                            <LineChart data={behaviour.spending_trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={t.dark ? '#1e2f4a' : '#e2e8f0'} />
                                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: t.textSecondary }} />
                                                <YAxis tick={{ fontSize: 11, fill: t.textSecondary }} />
                                                <Tooltip content={<CustomTooltip prefix="₹" />} />
                                                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Card>
                                )}
                            </div>

                            {/* Budget vs Actual */}
                            {behaviour?.budget_vs_actual?.length > 0 && (
                                <Card>
                                    <SectionTitle>Budget vs Actual Spending</SectionTitle>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={behaviour.budget_vs_actual} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={t.dark ? '#1e2f4a' : '#e2e8f0'} />
                                            <XAxis dataKey="trip" tick={{ fontSize: 11, fill: t.textSecondary }} />
                                            <YAxis tick={{ fontSize: 11, fill: t.textSecondary }} />
                                            <Tooltip content={<CustomTooltip prefix="₹" />} />
                                            <Bar dataKey="budget" name="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.7} />
                                            <Bar dataKey="actual" name="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            )}

                            {/* Category-wise breakdown list */}
                            {charts?.expense_by_category?.length > 0 && (
                                <Card>
                                    <SectionTitle>Category Details</SectionTitle>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {charts.expense_by_category
                                            .sort((a, b) => b.value - a.value)
                                            .map((item, i) => {
                                                const total = charts.expense_by_category.reduce((s, x) => s + x.value, 0)
                                                const pct = ((item.value / total) * 100).toFixed(1)
                                                return (
                                                    <div key={item.name}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                            <span style={{ fontSize: 13, color: t.textSecondary }}>{item.name}</span>
                                                            <span style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary }}>₹{item.value.toLocaleString()} <span style={{ color: COLORS[i % COLORS.length], fontWeight: 600 }}>({pct}%)</span></span>
                                                        </div>
                                                        <div style={{ height: 6, borderRadius: 3, background: t.dark ? '#1e2f4a' : '#e2e8f0' }}>
                                                            <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: COLORS[i % COLORS.length], transition: 'width 0.8s ease' }} />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* TRAVEL TAB */}
                    {activeTab === 'travel' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {/* Travel type pie */}
                                {charts?.travel_type_distribution?.length > 0 && (
                                    <Card>
                                        <SectionTitle>Travel Style</SectionTitle>
                                        <ResponsiveContainer width="100%" height={240}>
                                            <PieChart>
                                                <Pie data={charts.travel_type_distribution} dataKey="value" nameKey="name"
                                                    cx="50%" cy="50%" outerRadius={85} paddingAngle={4}>
                                                    {charts.travel_type_distribution.map((_, i) => (
                                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Card>
                                )}

                                {/* Season distribution */}
                                {behaviour?.season_distribution && Object.keys(behaviour.season_distribution).length > 0 && (
                                    <Card>
                                        <SectionTitle>Travel by Season</SectionTitle>
                                        <ResponsiveContainer width="100%" height={240}>
                                            <PieChart>
                                                <Pie
                                                    data={Object.entries(behaviour.season_distribution).map(([k, v]) => ({ name: k, value: v }))}
                                                    dataKey="value" nameKey="name"
                                                    cx="50%" cy="50%" outerRadius={85} paddingAngle={4}>
                                                    {Object.keys(behaviour.season_distribution).map((_, i) => (
                                                        <Cell key={i} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 4]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Card>
                                )}
                            </div>

                            {/* Place categories bar */}
                            {charts?.place_categories?.length > 0 && (
                                <Card>
                                    <SectionTitle>Places Explored by Category</SectionTitle>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={charts.place_categories} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={t.dark ? '#1e2f4a' : '#e2e8f0'} />
                                            <XAxis dataKey="category" tick={{ fontSize: 11, fill: t.textSecondary }} />
                                            <YAxis tick={{ fontSize: 11, fill: t.textSecondary }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                                {charts.place_categories.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            )}

                            {/* Top rated places */}
                            {behaviour?.top_rated_places?.length > 0 && (
                                <Card>
                                    <SectionTitle>⭐ Top Rated Places</SectionTitle>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {behaviour.top_rated_places.map((place, i) => (
                                            <div key={i} style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '12px 16px', borderRadius: 10,
                                                background: t.dark ? 'rgba(255,255,255,0.03)' : '#f8fafc'
                                            }}>
                                                <div>
                                                    <p style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary, marginBottom: 2 }}>{place.name}</p>
                                                    <p style={{ fontSize: 12, color: t.textSecondary }}>{place.category}</p>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontSize: 16 }}>⭐</span>
                                                    <span style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>{place.rating}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* BEHAVIOUR TAB */}
                    {activeTab === 'behaviour' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Behaviour stat cards */}
                            {behaviour && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
                                    {[
                                        { icon: '🗓️', label: 'Avg Trip Duration', value: `${behaviour.avg_trip_duration} days`, grad: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
                                        { icon: '📆', label: 'Most Active Month', value: behaviour.most_active_month, grad: 'linear-gradient(135deg,#10b981,#059669)' },
                                        { icon: '🌤️', label: 'Favorite Season', value: behaviour.favorite_season, grad: 'linear-gradient(135deg,#f59e0b,#d97706)' },
                                    ].map(card => (
                                        <StatCard key={card.label} {...card} />
                                    ))}
                                </div>
                            )}

                            {/* Month distribution */}
                            {behaviour?.month_distribution && Object.keys(behaviour.month_distribution).length > 0 && (
                                <Card>
                                    <SectionTitle>Trips by Month</SectionTitle>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart
                                            data={Object.entries(behaviour.month_distribution).map(([k, v]) => ({ month: k, trips: v }))}
                                            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={t.dark ? '#1e2f4a' : '#e2e8f0'} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: t.textSecondary }} />
                                            <YAxis tick={{ fontSize: 11, fill: t.textSecondary }} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="trips" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            )}

                            {/* Budget discipline */}
                            {behaviour?.budget_vs_actual?.length > 0 && (
                                <Card>
                                    <SectionTitle>Budget Discipline Per Trip</SectionTitle>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {behaviour.budget_vs_actual.map((item, i) => {
                                            const pct = item.budget > 0 ? Math.min((item.actual / item.budget) * 100, 150) : 0
                                            const over = item.actual > item.budget
                                            return (
                                                <div key={i}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                        <span style={{ fontSize: 13, color: t.textPrimary, fontWeight: 600 }}>{item.trip}</span>
                                                        <span style={{ fontSize: 12, color: over ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                                                            {over ? '⚠️ Over' : '✅ Within'} budget
                                                        </span>
                                                    </div>
                                                    <div style={{ height: 8, borderRadius: 4, background: t.dark ? '#1e2f4a' : '#e2e8f0', position: 'relative' }}>
                                                        <div style={{
                                                            height: '100%', borderRadius: 4,
                                                            width: `${Math.min(pct, 100)}%`,
                                                            background: over ? '#ef4444' : 'linear-gradient(90deg,#3b82f6,#10b981)',
                                                            transition: 'width 0.8s ease'
                                                        }} />
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                                        <span style={{ fontSize: 11, color: t.textSecondary }}>Spent: ₹{item.actual.toLocaleString()}</span>
                                                        <span style={{ fontSize: 11, color: t.textSecondary }}>Budget: ₹{item.budget.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}