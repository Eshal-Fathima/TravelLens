import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/axios'
import { useTheme } from '../design/Themecontext'
import { Spinner, EmptyState } from '../design/UI'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'

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
        tertiary: '#611a07',
        navBg: 'rgba(253,250,231,0.85)',
        chartGrid: '#e2e8f0',
        chartBg: '#f8fafc',
        tabActive: 'linear-gradient(135deg,#003461,#004b87)',
        tabInactive: '#e6e3d0',
        tabInactiveText: '#424750',
        // stat cards — light uses gradient for first, flat for rest
        s1grad: 'linear-gradient(135deg,#003461,#004b87)',
        s2bg: '#f7f4e1',
        s3bg: '#e6e3d0',
        s4grad: 'linear-gradient(135deg,#1b6d24,#005312)',
        s5bg: '#ece9d6',
        s6bg: '#ffffff',
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
        tertiary: '#ffb4a1',
        navBg: 'rgba(10,10,10,0.80)',
        chartGrid: '#1e2f4a',
        chartBg: 'rgba(255,255,255,0.03)',
        tabActive: 'linear-gradient(135deg,#3b82f6,#6366f1)',
        tabInactive: 'rgba(255,255,255,0.06)',
        tabInactiveText: '#b0b0b0',
        s1grad: 'linear-gradient(135deg,#3b82f6,#6366f1)',
        s2bg: '#141414',
        s3bg: '#353535',
        s4grad: 'linear-gradient(135deg,#10b981,#059669)',
        s5bg: '#2a2a2a',
        s6bg: '#1f1f1f',
    },
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
    if (active && payload?.length) {
        return (
            <div style={{
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: 10, padding: '10px 14px',
                fontFamily: 'Manrope, sans-serif',
            }}>
                <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ fontSize: 13, fontWeight: 700, color: p.color || '#fff' }}>
                        {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}{suffix}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

// ─── Stat Card (gradient or flat) ────────────────────────────────────────────
function StatCard({ icon, label, value, sub, badge, badgeColor, grad, bg, textColor, isDark, t, mini }) {
    const isGrad = !!grad
    return (
        <div style={{
            borderRadius: 16, padding: mini ? '20px 20px' : '28px 24px',
            background: isGrad ? grad : (bg || t.cardLow),
            border: isGrad ? 'none' : `1px solid ${t.border}`,
            boxShadow: isGrad
                ? (isDark ? '0 8px 28px rgba(0,0,0,0.4)' : '0 8px 28px rgba(28,28,17,0.12)')
                : (isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(28,28,17,0.06)'),
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.2s',
            cursor: 'default',
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
            {/* decorative background icon */}
            {isGrad && (
                <div style={{
                    position: 'absolute', bottom: -10, right: -10,
                    fontSize: 80, opacity: 0.08, pointerEvents: 'none', lineHeight: 1,
                }}>{icon}</div>
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase',
                    color: isGrad ? 'rgba(255,255,255,0.65)' : t.textMuted,
                    margin: '0 0 16px', fontFamily: 'Manrope, sans-serif',
                }}>{label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                    <span style={{
                        fontSize: 38, fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1,
                        color: isGrad ? '#fff' : (textColor || t.primary),
                        fontFamily: 'Lora, serif',
                    }}>{value}</span>
                    {badge && (
                        <span style={{
                            fontSize: 11, fontWeight: 700,
                            color: badgeColor || (isGrad ? 'rgba(255,255,255,0.7)' : t.accent),
                        }}>{badge}</span>
                    )}
                </div>
                {sub && (
                    <p style={{ fontSize: 10, color: isGrad ? 'rgba(255,255,255,0.45)' : t.textMuted, margin: 0, letterSpacing: '0.5px' }}>
                        {sub}
                    </p>
                )}
            </div>
        </div>
    )
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ children, t }) {
    return (
        <p style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '2.5px',
            textTransform: 'uppercase', color: t.textMuted,
            fontFamily: 'Manrope, sans-serif', margin: '0 0 18px',
        }}>{children}</p>
    )
}

// ─── Panel card ───────────────────────────────────────────────────────────────
function Panel({ children, t, isDark, style }) {
    return (
        <div style={{
            borderRadius: 20, padding: '28px',
            background: isDark ? t.card : t.cardLow,
            border: `1px solid ${t.border}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(28,28,17,0.06)',
            ...style,
        }}>{children}</div>
    )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Analytics() {
    const { user } = useAuth()
    const { dark: ctxDark } = useTheme()

    const [isDark, setIsDark] = useState(ctxDark ?? false)
    useEffect(() => { if (ctxDark !== undefined) setIsDark(ctxDark) }, [ctxDark])
    const t = themes[isDark ? 'dark' : 'light']

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
            api.get(`/api/analytics/behaviour/${uid}`),
        ]).then(([ov, ch, bh]) => {
            setOverview(ov.data.overview)
            setCharts(ch.data.charts)
            setBehaviour(bh.data.behaviour)
        }).catch(console.error)
            .finally(() => setLoading(false))
    }, [user.id])

    if (loading) return <Spinner />

    const noData = !overview || overview.total_trips === 0

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'spending', label: '💸 Spending' },
        { id: 'travel', label: '✈️ Travel' },
        { id: 'behaviour', label: '👤 Behaviour' },
    ]

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Lora:ital,wght@0,700;1,700&display=swap');
        * { box-sizing: border-box; }
        @keyframes an-fade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .an-hover { transition: transform 0.2s; }
        .an-hover:hover { transform: translateY(-3px); }
      `}</style>

            <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Manrope, sans-serif', transition: 'background 0.3s' }}>

                {/* dot-grid background */}
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
                    <header style={{ margin: '48px 0 32px', animation: 'an-fade 0.45s ease both' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: t.accent, margin: '0 0 10px' }}>
                            Deep Dive
                        </p>
                        <h1 style={{
                            fontSize: 'clamp(36px,5vw,58px)', fontWeight: 900,
                            letterSpacing: '-2px', color: t.primary, lineHeight: 1,
                            margin: '0 0 10px', fontFamily: 'Manrope, sans-serif',
                        }}>Travel Analytics</h1>
                        <p style={{ fontSize: 15, color: t.textMuted, margin: 0, maxWidth: 520 }}>
                            Deep insights into your travel patterns and spending habits.
                        </p>
                    </header>

                    {noData ? (
                        <EmptyState icon="📊" title="No analytics yet" desc="Start logging trips to unlock your travel analytics dashboard" />
                    ) : (
                        <>
                            {/* ── Tabs ── */}
                            <div style={{
                                display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap',
                                animation: 'an-fade 0.45s 0.06s ease both',
                            }}>
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            padding: '9px 20px', borderRadius: 999, border: 'none',
                                            cursor: 'pointer', fontSize: 13, fontWeight: 700,
                                            fontFamily: 'Manrope, sans-serif', transition: 'all 0.2s',
                                            background: activeTab === tab.id ? t.tabActive : t.tabInactive,
                                            color: activeTab === tab.id ? '#fff' : t.tabInactiveText,
                                            boxShadow: activeTab === tab.id
                                                ? (isDark ? '0 4px 12px rgba(99,102,241,0.3)' : '0 4px 12px rgba(0,52,97,0.2)')
                                                : 'none',
                                        }}
                                    >{tab.label}</button>
                                ))}
                            </div>

                            {/* ══ OVERVIEW TAB ══ */}
                            {activeTab === 'overview' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'an-fade 0.4s ease both' }}>

                                    {/* 6 stat cards — bento style from HTML */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                                        <StatCard
                                            label="Total Trips" icon="✈️"
                                            value={overview.total_trips}
                                            badge={`+${Math.max(1, Math.round(overview.total_trips * 0.12))}% this year`}
                                            grad={t.s1grad} isDark={isDark} t={t}
                                        />
                                        <StatCard
                                            label="Total Spent" icon="💸"
                                            value={`₹${((overview.total_spent || 0) / 1000).toFixed(1)}K`}
                                            sub="Across all trips"
                                            bg={t.s2bg} isDark={isDark} t={t}
                                        />
                                        <StatCard
                                            label="Destinations" icon="📍"
                                            value={overview.total_destinations}
                                            sub="Unique places"
                                            bg={t.s3bg} isDark={isDark} t={t}
                                        />
                                        <StatCard
                                            label="Places Visited" icon="🏛️"
                                            value={overview.total_places}
                                            badge="Verified"
                                            badgeColor={isDark ? '#adc6ff' : t.tertiary}
                                            grad={t.s4grad} isDark={isDark} t={t}
                                        />
                                        <StatCard
                                            label="Avg Duration" icon="📅"
                                            value={`${overview.avg_trip_duration}d`}
                                            sub="Per trip average"
                                            bg={t.s5bg} isDark={isDark} t={t}
                                        />
                                        <StatCard
                                            label="Avg Trip Cost" icon="💰"
                                            value={`₹${((overview.avg_trip_cost || 0) / 1000).toFixed(1)}K`}
                                            badge="↓ trending"
                                            badgeColor={t.accent}
                                            bg={t.s6bg} isDark={isDark} t={t}
                                        />
                                    </div>

                                    {/* Trips per month chart + insight side card */}
                                    {charts?.trips_per_month?.length > 0 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                                            <Panel t={t} isDark={isDark}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
                                                    <div>
                                                        <h3 style={{ fontSize: 20, fontWeight: 900, color: t.primary, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                                                            Trips Per Month
                                                        </h3>
                                                        <p style={{ fontSize: 11, color: t.textMuted, margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                                            Frequency analysis
                                                        </p>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <span style={{
                                                            fontSize: 9, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase',
                                                            padding: '4px 12px', borderRadius: 999,
                                                            background: t.primaryFixed, color: t.primary,
                                                        }}>All Trips</span>
                                                    </div>
                                                </div>
                                                <ResponsiveContainer width="100%" height={220}>
                                                    <BarChart data={charts.trips_per_month} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: t.textMuted, fontFamily: 'Manrope' }} />
                                                        <YAxis tick={{ fontSize: 10, fill: t.textMuted, fontFamily: 'Manrope' }} allowDecimals={false} />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Bar dataKey="trips" radius={[6, 6, 0, 0]}
                                                            fill={isDark ? '#3b82f6' : t.primary} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Panel>

                                            {/* insight card */}
                                            <Panel t={t} isDark={isDark} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <div>
                                                    <SectionHead t={t}>Journal Insight</SectionHead>
                                                    <div style={{
                                                        width: 48, height: 48, borderRadius: '50%',
                                                        background: t.primaryFaded,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 22, marginBottom: 16,
                                                    }}>💡</div>
                                                    <p style={{
                                                        fontSize: 15, fontFamily: 'Lora, serif', fontStyle: 'italic',
                                                        color: t.textPrimary, lineHeight: 1.7, margin: '0 0 16px',
                                                    }}>
                                                        "{behaviour?.most_active_month
                                                            ? `You travel most in ${behaviour.most_active_month}. Consider planning your next trip around this pattern.`
                                                            : 'Keep logging trips to unlock personalized travel insights.'}"
                                                    </p>
                                                </div>
                                                <div style={{
                                                    padding: '12px 16px', borderRadius: 12,
                                                    background: t.accentFaded, border: `1px solid ${t.accent}20`,
                                                }}>
                                                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.accent, margin: '0 0 4px' }}>
                                                        Favorite Season
                                                    </p>
                                                    <p style={{ fontSize: 16, fontWeight: 800, color: t.textPrimary, margin: 0 }}>
                                                        {behaviour?.favorite_season || '–'}
                                                    </p>
                                                </div>
                                            </Panel>
                                        </div>
                                    )}

                                    {/* Category breakdown row — from dark HTML */}
                                    {charts?.expense_by_category?.length > 0 && (
                                        <Panel t={t} isDark={isDark}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                                <h3 style={{ fontSize: 18, fontWeight: 900, color: t.primary, margin: 0, letterSpacing: '-0.5px' }}>
                                                    Category Breakdown
                                                </h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
                                                {charts.expense_by_category.slice(0, 4).map((item, i) => {
                                                    const total = charts.expense_by_category.reduce((s, x) => s + x.value, 0)
                                                    const pct = ((item.value / total) * 100).toFixed(0)
                                                    const c = CHART_COLORS[i % CHART_COLORS.length]
                                                    return (
                                                        <div key={item.name} style={{
                                                            padding: '16px 18px', borderRadius: 14,
                                                            background: isDark ? t.cardHigh : t.cardMid,
                                                            border: `1px solid ${t.border}`,
                                                            display: 'flex', alignItems: 'center', gap: 14,
                                                        }}>
                                                            <div style={{
                                                                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                                                                background: `${c}18`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: 18,
                                                            }}>
                                                                {['✈️', '🏨', '🍽️', '🚕'][i] || '💳'}
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: t.textMuted, margin: '0 0 4px' }}>
                                                                    {item.name}
                                                                </p>
                                                                <p style={{ fontSize: 20, fontWeight: 900, color: t.textPrimary, margin: 0, fontFamily: 'Lora, serif' }}>
                                                                    {pct}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </Panel>
                                    )}
                                </div>
                            )}

                            {/* ══ SPENDING TAB ══ */}
                            {activeTab === 'spending' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'an-fade 0.4s ease both' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                                        {/* Pie — expense breakdown */}
                                        {charts?.expense_by_category?.length > 0 && (
                                            <Panel t={t} isDark={isDark}>
                                                <SectionHead t={t}>Expense Breakdown</SectionHead>
                                                <ResponsiveContainer width="100%" height={260}>
                                                    <PieChart>
                                                        <Pie data={charts.expense_by_category} dataKey="value" nameKey="name"
                                                            cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                                                            {charts.expense_by_category.map((_, i) => (
                                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={v => `₹${v.toLocaleString('en-IN')}`} />
                                                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11, fontFamily: 'Manrope' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Panel>
                                        )}

                                        {/* Line — spending trend */}
                                        {behaviour?.spending_trend?.length > 0 && (
                                            <Panel t={t} isDark={isDark}>
                                                <SectionHead t={t}>Spending Trend</SectionHead>
                                                <ResponsiveContainer width="100%" height={260}>
                                                    <LineChart data={behaviour.spending_trend} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                                                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: t.textMuted, fontFamily: 'Manrope' }} />
                                                        <YAxis tick={{ fontSize: 10, fill: t.textMuted, fontFamily: 'Manrope' }} />
                                                        <Tooltip content={<CustomTooltip prefix="₹" />} />
                                                        <Line type="monotone" dataKey="amount" stroke={t.accent} strokeWidth={2.5}
                                                            dot={{ r: 4, fill: t.accent }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </Panel>
                                        )}
                                    </div>

                                    {/* Budget vs Actual */}
                                    {behaviour?.budget_vs_actual?.length > 0 && (
                                        <Panel t={t} isDark={isDark}>
                                            <SectionHead t={t}>Budget vs Actual Spending</SectionHead>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={behaviour.budget_vs_actual} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                                                    <XAxis dataKey="trip" tick={{ fontSize: 10, fill: t.textMuted, fontFamily: 'Manrope' }} />
                                                    <YAxis tick={{ fontSize: 10, fill: t.textMuted, fontFamily: 'Manrope' }} />
                                                    <Tooltip content={<CustomTooltip prefix="₹" />} />
                                                    <Bar dataKey="budget" name="Budget" fill={isDark ? '#3b82f6' : t.primary} radius={[4, 4, 0, 0]} opacity={0.7} />
                                                    <Bar dataKey="actual" name="Actual" fill={t.accent} radius={[4, 4, 0, 0]} />
                                                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11, fontFamily: 'Manrope' }} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Panel>
                                    )}

                                    {/* Category details list */}
                                    {charts?.expense_by_category?.length > 0 && (
                                        <Panel t={t} isDark={isDark}>
                                            <SectionHead t={t}>Category Details</SectionHead>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                                {[...charts.expense_by_category]
                                                    .sort((a, b) => b.value - a.value)
                                                    .map((item, i) => {
                                                        const total = charts.expense_by_category.reduce((s, x) => s + x.value, 0)
                                                        const pct = ((item.value / total) * 100).toFixed(1)
                                                        const c = CHART_COLORS[i % CHART_COLORS.length]
                                                        return (
                                                            <div key={item.name}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                                    <span style={{ fontSize: 13, color: t.textSecond, fontFamily: 'Manrope' }}>{item.name}</span>
                                                                    <span style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary }}>
                                                                        ₹{item.value.toLocaleString('en-IN')}{' '}
                                                                        <span style={{ color: c }}>({pct}%)</span>
                                                                    </span>
                                                                </div>
                                                                <div style={{ height: 7, borderRadius: 4, background: t.chartGrid }}>
                                                                    <div style={{
                                                                        height: '100%', borderRadius: 4,
                                                                        width: `${pct}%`, background: c,
                                                                        transition: 'width 0.8s ease',
                                                                    }} />
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                            </div>
                                        </Panel>
                                    )}
                                </div>
                            )}

                            {/* ══ TRAVEL TAB ══ */}
                            {activeTab === 'travel' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'an-fade 0.4s ease both' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                                        {charts?.travel_type_distribution?.length > 0 && (
                                            <Panel t={t} isDark={isDark}>
                                                <SectionHead t={t}>Travel Style</SectionHead>
                                                <ResponsiveContainer width="100%" height={240}>
                                                    <PieChart>
                                                        <Pie data={charts.travel_type_distribution} dataKey="value" nameKey="name"
                                                            cx="50%" cy="50%" outerRadius={85} paddingAngle={4}>
                                                            {charts.travel_type_distribution.map((_, i) => (
                                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11, fontFamily: 'Manrope' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Panel>
                                        )}

                                        {behaviour?.season_distribution && Object.keys(behaviour.season_distribution).length > 0 && (
                                            <Panel t={t} isDark={isDark}>
                                                <SectionHead t={t}>Travel by Season</SectionHead>
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
                                                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11, fontFamily: 'Manrope' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Panel>
                                        )}
                                    </div>

                                    {charts?.place_categories?.length > 0 && (
                                        <Panel t={t} isDark={isDark}>
                                            <SectionHead t={t}>Places Explored by Category</SectionHead>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={charts.place_categories} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                                                    <XAxis dataKey="category" tick={{ fontSize: 10, fill: t.textMuted, fontFamily: 'Manrope' }} />
                                                    <YAxis tick={{ fontSize: 10, fill: t.textMuted, fontFamily: 'Manrope' }} allowDecimals={false} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                                        {charts.place_categories.map((_, i) => (
                                                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Panel>
                                    )}

                                    {behaviour?.top_rated_places?.length > 0 && (
                                        <Panel t={t} isDark={isDark}>
                                            <SectionHead t={t}>⭐ Top Rated Places</SectionHead>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {behaviour.top_rated_places.map((place, i) => (
                                                    <div key={i} style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        padding: '14px 18px', borderRadius: 12,
                                                        background: isDark ? t.chartBg : t.cardMid,
                                                    }}>
                                                        <div>
                                                            <p style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary, margin: '0 0 2px', fontFamily: 'Manrope' }}>{place.name}</p>
                                                            <p style={{ fontSize: 11, color: t.textMuted, margin: 0 }}>{place.category}</p>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <span style={{ fontSize: 16 }}>⭐</span>
                                                            <span style={{ fontSize: 16, fontWeight: 800, color: '#f59e0b', fontFamily: 'Lora, serif' }}>{place.rating}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Panel>
                                    )}
                                </div>
                            )}

                            {/* ══ BEHAVIOUR TAB ══ */}
                            {activeTab === 'behaviour' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'an-fade 0.4s ease both' }}>

                                    {behaviour && (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                                            <StatCard label="Avg Trip Duration" icon="🗓️" value={`${behaviour.avg_trip_duration}d`}
                                                sub="Days per trip" grad={isDark ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : t.s1grad} isDark={isDark} t={t} />
                                            <StatCard label="Most Active Month" icon="📆" value={behaviour.most_active_month || '–'}
                                                sub="Peak travel month" grad={isDark ? 'linear-gradient(135deg,#10b981,#059669)' : t.s4grad} isDark={isDark} t={t} />
                                            <StatCard label="Favorite Season" icon="🌤️" value={behaviour.favorite_season || '–'}
                                                sub="Your travel season" bg={t.s3bg} isDark={isDark} t={t} />
                                        </div>
                                    )}

                                    {behaviour?.month_distribution && Object.keys(behaviour.month_distribution).length > 0 && (
                                        <Panel t={t} isDark={isDark}>
                                            <SectionHead t={t}>Trips by Month</SectionHead>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart
                                                    data={Object.entries(behaviour.month_distribution).map(([k, v]) => ({ month: k, trips: v }))}
                                                    margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} />
                                                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: t.textMuted, fontFamily: 'Manrope' }} />
                                                    <YAxis tick={{ fontSize: 10, fill: t.textMuted, fontFamily: 'Manrope' }} allowDecimals={false} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Bar dataKey="trips" fill={isDark ? '#8b5cf6' : '#611a07'} radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Panel>
                                    )}

                                    {behaviour?.budget_vs_actual?.length > 0 && (
                                        <Panel t={t} isDark={isDark}>
                                            <SectionHead t={t}>Budget Discipline Per Trip</SectionHead>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                {behaviour.budget_vs_actual.map((item, i) => {
                                                    const pct = item.budget > 0 ? Math.min((item.actual / item.budget) * 100, 150) : 0
                                                    const over = item.actual > item.budget
                                                    return (
                                                        <div key={i}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                                <span style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary, fontFamily: 'Manrope' }}>{item.trip}</span>
                                                                <span style={{ fontSize: 11, fontWeight: 700, color: over ? '#ef4444' : t.accent }}>
                                                                    {over ? '⚠️ Over budget' : '✅ Within budget'}
                                                                </span>
                                                            </div>
                                                            <div style={{ height: 8, borderRadius: 4, background: t.chartGrid }}>
                                                                <div style={{
                                                                    height: '100%', borderRadius: 4,
                                                                    width: `${Math.min(pct, 100)}%`,
                                                                    background: over ? '#ef4444' : (isDark ? 'linear-gradient(90deg,#3b82f6,#10b981)' : `linear-gradient(90deg,${t.primary},${t.accent})`),
                                                                    transition: 'width 0.8s ease',
                                                                }} />
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                                                                <span style={{ fontSize: 11, color: t.textMuted }}>Spent: ₹{item.actual.toLocaleString('en-IN')}</span>
                                                                <span style={{ fontSize: 11, color: t.textMuted }}>Budget: ₹{item.budget.toLocaleString('en-IN')}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </Panel>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}