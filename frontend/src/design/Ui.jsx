import { useTheme } from './ThemeContext'

// ── Page Header ──────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => {
    const { t } = useTheme()
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: t.textPrimary, letterSpacing: '-0.4px', marginBottom: 4 }}>{title}</h1>
                {subtitle && <p style={{ fontSize: 14, color: t.textSecondary }}>{subtitle}</p>}
            </div>
            {action}
        </div>
    )
}

// ── Card ─────────────────────────────────────────────────
export const Card = ({ children, style = {}, hover = false }) => {
    const { t } = useTheme()
    return (
        <div className={hover ? 'tl-card' : ''} style={{
            background: t.card, borderRadius: 14,
            border: `1px solid ${t.border}`,
            boxShadow: t.dark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 16px rgba(0,0,0,0.06)',
            padding: 24, ...style
        }}>
            {children}
        </div>
    )
}

// ── Button ────────────────────────────────────────────────
export const Btn = ({ children, variant = 'primary', onClick, disabled, type = 'button', style = {}, small = false }) => {
    const { t } = useTheme()
    const base = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        borderRadius: 10, border: 'none', fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, fontSize: small ? 13 : 14,
        padding: small ? '7px 14px' : '10px 20px', transition: 'all 0.18s',
        ...style
    }
    const variants = {
        primary: { background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' },
        danger: { background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', boxShadow: '0 4px 14px rgba(239,68,68,0.25)' },
        ghost: { background: t.dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', color: t.textSecondary, boxShadow: 'none' },
        outline: { background: 'transparent', color: t.textSecondary, border: `1px solid ${t.border}`, boxShadow: 'none' },
    }
    return (
        <button type={type} onClick={onClick} disabled={disabled} className="tl-btn" style={{ ...base, ...variants[variant] }}>
            {children}
        </button>
    )
}

// ── Input ─────────────────────────────────────────────────
export const Input = ({ label, type = 'text', value, onChange, placeholder, required, min, max, step, rows, as = 'input', style = {} }) => {
    const { t } = useTheme()
    const inputStyle = {
        width: '100%', padding: '9px 13px', borderRadius: 9,
        border: `1.5px solid ${t.inputBorder}`, background: t.input,
        color: t.textPrimary, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
        transition: 'border 0.18s', outline: 'none', ...style
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {label && <label style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, letterSpacing: '0.3px' }}>{label}</label>}
            {as === 'textarea'
                ? <textarea className="tl-input" value={value} onChange={onChange} placeholder={placeholder} required={required} rows={rows || 3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
                : <input className="tl-input" type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} min={min} max={max} step={step} style={inputStyle} />
            }
        </div>
    )
}

// ── Select ────────────────────────────────────────────────
export const Select = ({ label, value, onChange, children, required }) => {
    const { t } = useTheme()
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {label && <label style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, letterSpacing: '0.3px' }}>{label}</label>}
            <select className="tl-input" value={value} onChange={onChange} required={required} style={{
                width: '100%', padding: '9px 13px', borderRadius: 9,
                border: `1.5px solid ${t.inputBorder}`, background: t.input,
                color: t.textPrimary, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer', outline: 'none',
            }}>
                {children}
            </select>
        </div>
    )
}

// ── Modal ─────────────────────────────────────────────────
export const Modal = ({ title, onClose, children }) => {
    const { t } = useTheme()
    return (
        <div className="tl-modal-overlay" style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, backdropFilter: 'blur(4px)',
        }}>
            <div className="tl-modal-box" style={{
                background: t.modalBg, borderRadius: 16, padding: '28px',
                width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto',
                border: `1px solid ${t.border}`,
                boxShadow: t.dark ? '0 25px 60px rgba(0,0,0,0.6)' : '0 25px 60px rgba(0,0,0,0.15)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: t.textPrimary }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSecondary, padding: 4, borderRadius: 6, fontSize: 20, lineHeight: 1 }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    )
}

// ── Badge ─────────────────────────────────────────────────
export const Badge = ({ children, color = '#3b82f6' }) => (
    <span style={{
        display: 'inline-block', padding: '3px 9px', borderRadius: 20,
        fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
        background: `${color}18`, color: color, border: `1px solid ${color}30`,
    }}>
        {children}
    </span>
)

// ── Empty State ───────────────────────────────────────────
export const EmptyState = ({ icon, title, desc, action }) => {
    const { t } = useTheme()
    return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>{icon}</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: t.textPrimary, marginBottom: 8 }}>{title}</h3>
            <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 20 }}>{desc}</p>
            {action}
        </div>
    )
}

// ── Spinner ───────────────────────────────────────────────
export const Spinner = () => {
    const { t } = useTheme()
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${t.border}`, borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

// ── Section Title ─────────────────────────────────────────
export const SectionTitle = ({ children }) => {
    const { t } = useTheme()
    return (
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: t.textPrimary, marginBottom: 16 }}>{children}</h2>
    )
}

// ── Stat Card ─────────────────────────────────────────────
export const StatCard = ({ label, value, icon, gradient, sub }) => {
    const { t } = useTheme()
    return (
        <div className="tl-card" style={{
            background: t.card, borderRadius: 14, padding: '20px 22px',
            border: `1px solid ${t.border}`,
            boxShadow: t.dark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 16px rgba(0,0,0,0.06)',
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    {icon}
                </div>
            </div>
            <p style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500, marginBottom: 3 }}>{label}</p>
            <p style={{ fontSize: 26, fontWeight: 700, color: t.textPrimary, fontFamily: "'Playfair Display', serif", letterSpacing: '-0.5px' }}>{value}</p>
            {sub && <p style={{ fontSize: 11, color: t.textMuted, marginTop: 3 }}>{sub}</p>}
            <div style={{ position: 'absolute', bottom: -14, right: -14, width: 56, height: 56, borderRadius: '50%', background: gradient, opacity: 0.1 }} />
        </div>
    )
}

// ── Trip Selector ─────────────────────────────────────────
export const TripSelector = ({ trips, value, onChange }) => {
    const { t } = useTheme()
    return (
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, whiteSpace: 'nowrap' }}>Select Trip:</label>
            <select value={value} onChange={e => onChange(e.target.value)} className="tl-input" style={{
                padding: '8px 14px', borderRadius: 9, border: `1.5px solid ${t.inputBorder}`,
                background: t.input, color: t.textPrimary, fontSize: 14,
                fontFamily: "'DM Sans', sans-serif", outline: 'none', cursor: 'pointer', maxWidth: 320,
            }}>
                <option value="">Choose a trip…</option>
                {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>{trip.trip_name} — {trip.destination}</option>
                ))}
            </select>
        </div>
    )
}