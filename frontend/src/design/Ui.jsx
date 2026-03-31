import { useTheme } from './Themecontext'

// ── Page Header ──────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => {
    const { t } = useTheme()
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
                <h1 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 34, fontWeight: 700,
                    color: t.textPrimary,
                    letterSpacing: '-0.5px',
                    marginBottom: 6,
                    lineHeight: 1.1,
                }}>{title}</h1>
                {subtitle && <p style={{ fontSize: 14, color: t.textSecondary, fontWeight: 400 }}>{subtitle}</p>}
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
            background: t.card,
            borderRadius: 16,
            border: `1px solid ${t.border}`,
            boxShadow: t.dark
                ? '0 4px 24px rgba(0,0,0,0.35)'
                : '0 2px 20px rgba(0,0,0,0.06)',
            padding: 24,
            ...style,
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
        borderRadius: 11, border: 'none',
        fontFamily: "'Sora', sans-serif",
        fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        fontSize: small ? 12 : 13.5,
        padding: small ? '7px 14px' : '10px 20px',
        transition: 'all 0.2s ease',
        letterSpacing: '0.2px',
        ...style,
    }
    const variants = {
        primary: {
            background: 'linear-gradient(135deg, #e8a87c, #d4834a)',
            color: 'white',
            boxShadow: '0 4px 16px rgba(232,168,124,0.35)',
        },
        danger: {
            background: 'linear-gradient(135deg, #e87c7c, #d45555)',
            color: 'white',
            boxShadow: '0 4px 14px rgba(232,124,124,0.3)',
        },
        ghost: {
            background: t.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            color: t.textSecondary,
            boxShadow: 'none',
        },
        outline: {
            background: 'transparent',
            color: t.textSecondary,
            border: `1px solid ${t.border}`,
            boxShadow: 'none',
        },
    }
    return (
        <button type={type} onClick={onClick} disabled={disabled} className="tl-btn"
            style={{ ...base, ...variants[variant] }}
            onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = disabled ? '0.4' : '1' }}
        >
            {children}
        </button>
    )
}

// ── Input ─────────────────────────────────────────────────
export const Input = ({ label, type = 'text', value, onChange, placeholder, required, min, max, step, rows, as = 'input', style = {} }) => {
    const { t } = useTheme()
    const inputStyle = {
        width: '100%', padding: '10px 14px', borderRadius: 10,
        border: `1.5px solid ${t.inputBorder}`,
        background: t.input,
        color: t.textPrimary, fontSize: 13.5,
        fontFamily: "'Sora', sans-serif",
        transition: 'border 0.18s, box-shadow 0.18s',
        outline: 'none',
        ...style,
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && (
                <label style={{
                    fontSize: 11.5, fontWeight: 600, color: t.textSecondary,
                    letterSpacing: '0.8px', textTransform: 'uppercase',
                }}>{label}</label>
            )}
            {as === 'textarea'
                ? <textarea className="tl-input" value={value} onChange={onChange} placeholder={placeholder}
                    required={required} rows={rows || 3}
                    style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
                : <input className="tl-input" type={type} value={value} onChange={onChange}
                    placeholder={placeholder} required={required} min={min} max={max} step={step}
                    style={inputStyle} />
            }
        </div>
    )
}

// ── Select ────────────────────────────────────────────────
export const Select = ({ label, value, onChange, children, required }) => {
    const { t } = useTheme()
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {label && (
                <label style={{
                    fontSize: 11.5, fontWeight: 600, color: t.textSecondary,
                    letterSpacing: '0.8px', textTransform: 'uppercase',
                }}>{label}</label>
            )}
            <select className="tl-input" value={value} onChange={onChange} required={required} style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: `1.5px solid ${t.inputBorder}`,
                background: t.input,
                color: t.textPrimary, fontSize: 13.5,
                fontFamily: "'Sora', sans-serif",
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
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, backdropFilter: 'blur(8px)',
        }}>
            <div className="tl-modal-box" style={{
                background: t.modalBg, borderRadius: 20,
                padding: '30px',
                width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
                border: `1px solid ${t.borderStrong}`,
                boxShadow: t.dark
                    ? '0 30px 80px rgba(0,0,0,0.7)'
                    : '0 30px 80px rgba(0,0,0,0.18)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 22, fontWeight: 700, color: t.textPrimary,
                    }}>{title}</h2>
                    <button onClick={onClose} style={{
                        background: t.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        border: 'none', cursor: 'pointer', color: t.textSecondary,
                        width: 30, height: 30, borderRadius: 8,
                        fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    )
}

// ── Badge ─────────────────────────────────────────────────
export const Badge = ({ children, color = '#e8a87c' }) => (
    <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 20,
        fontSize: 11, fontWeight: 600, fontFamily: "'Sora', sans-serif",
        background: `${color}18`, color: color,
        border: `1px solid ${color}28`,
        letterSpacing: '0.3px',
    }}>
        {children}
    </span>
)

// ── Empty State ───────────────────────────────────────────
export const EmptyState = ({ icon, title, desc, action }) => {
    const { t } = useTheme()
    return (
        <div style={{ textAlign: 'center', padding: '70px 20px' }}>
            <div style={{ fontSize: 56, marginBottom: 18, opacity: 0.7 }}>{icon}</div>
            <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 24, fontWeight: 700,
                color: t.textPrimary, marginBottom: 10,
            }}>{title}</h3>
            <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 24, lineHeight: 1.6 }}>{desc}</p>
            {action}
        </div>
    )
}

// ── Spinner ───────────────────────────────────────────────
export const Spinner = () => {
    const { t } = useTheme()
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{
                width: 38, height: 38,
                border: `3px solid ${t.border}`,
                borderTopColor: '#e8a87c',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )
}

// ── Section Title ─────────────────────────────────────────
export const SectionTitle = ({ children }) => {
    const { t } = useTheme()
    return (
        <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20, fontWeight: 700,
            color: t.textPrimary, marginBottom: 18,
            letterSpacing: '-0.2px',
        }}>{children}</h2>
    )
}

// ── Stat Card ─────────────────────────────────────────────
export const StatCard = ({ label, value, icon, gradient, sub }) => {
    const { t } = useTheme()
    return (
        <div className="tl-card" style={{
            background: t.card, borderRadius: 16, padding: '22px 24px',
            border: `1px solid ${t.border}`,
            boxShadow: t.dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 2px 20px rgba(0,0,0,0.06)',
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                }}>
                    {icon}
                </div>
            </div>
            <p style={{ fontSize: 11.5, color: t.textSecondary, fontWeight: 500, marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</p>
            <p style={{
                fontSize: 28, fontWeight: 700, color: t.textPrimary,
                fontFamily: "'Cormorant Garamond', serif",
                letterSpacing: '-0.5px',
            }}>{value}</p>
            {sub && <p style={{ fontSize: 11.5, color: t.textMuted, marginTop: 4 }}>{sub}</p>}
            <div style={{
                position: 'absolute', bottom: -16, right: -16,
                width: 70, height: 70, borderRadius: '50%',
                background: gradient, opacity: 0.08,
            }} />
        </div>
    )
}

// ── Trip Selector ─────────────────────────────────────────
export const TripSelector = ({ trips, value, onChange }) => {
    const { t } = useTheme()
    return (
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
            <label style={{
                fontSize: 11.5, fontWeight: 600, color: t.textSecondary,
                whiteSpace: 'nowrap', letterSpacing: '0.8px', textTransform: 'uppercase',
            }}>Trip:</label>
            <select value={value} onChange={e => onChange(e.target.value)} className="tl-input" style={{
                padding: '9px 16px', borderRadius: 10,
                border: `1.5px solid ${t.inputBorder}`,
                background: t.input, color: t.textPrimary, fontSize: 13.5,
                fontFamily: "'Sora', sans-serif", outline: 'none',
                cursor: 'pointer', maxWidth: 360,
            }}>
                <option value="">Choose a trip…</option>
                {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>{trip.trip_name} — {trip.destination}</option>
                ))}
            </select>
        </div>
    )
}