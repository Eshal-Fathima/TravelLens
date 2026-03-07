import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from './Themecontext'

// ── Icons ──────────────────────────────────────────────
const Icon = ({ d, size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
)
const PlaneIcon = () => <Icon d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
const GridIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
const MapPinIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
const WalletIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" /></svg>
const CompassIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
const BarChartIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>
const StarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
const HotelIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
const BellIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
const SunIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
const MoonIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
const LogoutIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>

const navItems = [
    { icon: GridIcon, label: 'Dashboard', href: '/dashboard' },
    { icon: PlaneIcon, label: 'Trips', href: '/trip-logger' },
    { icon: MapPinIcon, label: 'Places', href: '/places-logger' },
    { icon: HotelIcon, label: 'Hotels', href: '/hotel-logger' },
    { icon: WalletIcon, label: 'Expenses', href: '/expense-tracker' },
    { icon: BarChartIcon, label: 'Insights', href: '/insights' },
    { icon: StarIcon, label: 'Recommendations', href: '/recommendations' },
]

export default function Layout({ children, user, onLogout }) {
    const { t, dark, toggleDark } = useTheme()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = () => {
        if (onLogout) onLogout()
        navigate('/login')
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: t.bg, fontFamily: "'DM Sans', sans-serif", transition: 'background 0.3s' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${dark ? '#1e2f4a' : '#cbd5e1'}; border-radius: 4px; }
        .tl-nav-item { transition: all 0.18s ease; }
        .tl-nav-item:hover { background: ${dark ? '#1a2840' : '#f1f5f9'} !important; color: ${dark ? '#f0f4ff' : '#0f172a'} !important; }
        .tl-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .tl-card:hover { transform: translateY(-2px); }
        .tl-btn { transition: all 0.18s ease; cursor: pointer; }
        .tl-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .tl-input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .tl-modal-overlay { animation: fadeIn 0.18s ease; }
        .tl-modal-box { animation: slideUp 0.22s ease; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        .tl-page { animation: pageFadeIn 0.25s ease; }
        @keyframes pageFadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

            {/* ── Sidebar ── */}
            <aside style={{
                width: 232, minHeight: '100vh', background: t.sidebar,
                borderRight: `1px solid ${t.border}`,
                display: 'flex', flexDirection: 'column',
                padding: '20px 12px',
                position: 'fixed', top: 0, left: 0, bottom: 0,
                boxShadow: dark ? '4px 0 30px rgba(0,0,0,0.4)' : '4px 0 20px rgba(0,0,0,0.04)',
                zIndex: 100, transition: 'all 0.3s',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 24px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(59,130,246,0.4)', flexShrink: 0 }}>
                        <span style={{ fontSize: 17 }}>✈️</span>
                    </div>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: t.textPrimary, letterSpacing: '-0.3px' }}>TravelLens</span>
                </div>

                {/* Nav label */}
                <p style={{ fontSize: 10, fontWeight: 600, color: t.textMuted, letterSpacing: '1.2px', textTransform: 'uppercase', padding: '0 10px', marginBottom: 6 }}>Menu</p>

                {/* Nav items */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {navItems.map(item => {
                        const active = location.pathname === item.href
                        return (
                            <Link key={item.href} to={item.href} className="tl-nav-item" style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
                                background: active ? (dark ? 'rgba(59,130,246,0.14)' : 'rgba(59,130,246,0.08)') : 'transparent',
                                color: active ? '#3b82f6' : t.textSecondary,
                                fontWeight: active ? 600 : 400, fontSize: 14,
                                borderLeft: `3px solid ${active ? '#3b82f6' : 'transparent'}`,
                            }}>
                                <item.icon />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Dark mode toggle */}
                <button onClick={toggleDark} className="tl-btn" style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                    borderRadius: 10, border: `1px solid ${t.border}`, background: 'transparent',
                    color: t.textSecondary, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                    marginBottom: 8,
                }}>
                    {dark ? <SunIcon /> : <MoonIcon />}
                    {dark ? 'Light Mode' : 'Dark Mode'}
                </button>

                {/* User card */}
                {user && (
                    <div style={{ padding: '10px 10px', borderRadius: 12, background: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${t.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                                {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                                <p style={{ fontSize: 10, color: t.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                            </div>
                            <button onClick={handleLogout} title="Logout" className="tl-btn" style={{ background: 'none', border: 'none', color: t.textMuted, padding: 4, borderRadius: 6, flexShrink: 0 }}>
                                <LogoutIcon />
                            </button>
                        </div>
                    </div>
                )}
            </aside>

            {/* ── Main ── */}
            <main style={{ marginLeft: 232, flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* Top bar */}
                <header style={{
                    height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 28px', background: t.sidebar, borderBottom: `1px solid ${t.border}`,
                    position: 'sticky', top: 0, zIndex: 50, transition: 'all 0.3s',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {navItems.slice(0, 4).map(item => {
                            const active = location.pathname === item.href
                            return (
                                <Link key={item.href} to={item.href} style={{
                                    padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
                                    fontSize: 13, fontWeight: active ? 600 : 400,
                                    color: active ? '#3b82f6' : t.textSecondary,
                                    background: active ? (dark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.07)') : 'transparent',
                                    transition: 'all 0.18s',
                                }}>
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${t.border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textSecondary, cursor: 'pointer', position: 'relative' }}>
                            <BellIcon />
                            <span style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: '#ef4444', border: `2px solid ${t.sidebar}` }} />
                        </button>
                        {user && (
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer' }}>
                                {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <div className="tl-page" style={{ flex: 1, padding: '28px 28px', overflowY: 'auto' }}>
                    {children}
                </div>
            </main>
        </div>
    )
}