import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

/* ─── Theme tokens (mirrors Dashboard) ───────────────────────────────────── */
const themes = {
  light: {
    bg: 'rgba(253,250,231,0.82)',
    border: 'rgba(66,71,80,0.10)',
    textPrimary: '#1c1c11',
    textMuted: '#727781',
    textSecond: '#424750',
    primary: '#003461',
    accent: '#1b6d24',
    accentFaded: '#1b6d2418',
    inputBg: '#ece9d6',
    cardBg: '#f7f4e1',
    dropBg: '#fdfae7',
    activeLink: '#003461',
    hoverLink: '#004b87',
  },
  dark: {
    bg: 'rgba(17,17,37,0.82)',
    border: 'rgba(66,71,80,0.35)',
    textPrimary: '#e2e0fc',
    textMuted: '#8c919b',
    textSecond: '#c2c6d1',
    primary: '#a3c9ff',
    accent: '#4ae183',
    accentFaded: '#4ae18318',
    inputBg: '#1e1e32',
    cardBg: '#1e1e32',
    dropBg: '#0c0c1f',
    activeLink: '#a3c9ff',
    hoverLink: '#c2d8ff',
  }
}

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/trip-logger', label: 'Trips' },
  { to: '/expense-tracker', label: 'Expenses' },
  { to: '/insights', label: 'Insights' },
  { to: '/analytics', label: 'Analytics' },
]

const Navbar = ({ user, isDark, onToggleTheme }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const t = themes[isDark ? 'dark' : 'light']

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* ── Font injection ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Lora:ital,wght@1,700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;
          display:inline-flex; align-items:center; line-height:1;
        }
        .tl-nav-link { position:relative; font-family:'Manrope',sans-serif; font-weight:600; font-size:14px; text-decoration:none; padding:6px 2px; transition:color 0.2s; }
        .tl-nav-link::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:2px; border-radius:2px; background:currentColor; transform:scaleX(0); transition:transform 0.2s; transform-origin:left; }
        .tl-nav-link:hover::after, .tl-nav-link.active::after { transform:scaleX(1); }
        .tl-icon-btn { background:none; border:none; cursor:pointer; padding:8px; border-radius:10px; display:flex; align-items:center; justify-content:center; transition:background 0.2s; }
        .tl-icon-btn:hover { background: rgba(128,128,128,0.1); }
        .tl-dropdown { position:absolute; right:0; top:calc(100% + 10px); min-width:200px; border-radius:16px; overflow:hidden; z-index:200; box-shadow:0 16px 48px rgba(0,0,0,0.18); }
        .tl-drop-item { display:flex; align-items:center; gap:10px; padding:11px 16px; font-family:'Manrope',sans-serif; font-size:13px; font-weight:600; text-decoration:none; cursor:pointer; border:none; background:none; width:100%; text-align:left; transition:background 0.15s; }
        .tl-drop-item:hover { filter:brightness(1.07); }
        .tl-mobile-link { display:block; padding:12px 16px; border-radius:12px; text-decoration:none; font-family:'Manrope',sans-serif; font-weight:600; font-size:15px; transition:background 0.2s; }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 64,
        background: t.bg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${t.border}`,
        fontFamily: 'Manrope, sans-serif',
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', height: '100%', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* ── Logo ── */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg,${t.primary},${t.accent}66)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 18 }}>travel_explore</span>
            </div>
            <div>
              <span style={{ fontSize: 17, fontWeight: 900, color: t.textPrimary, letterSpacing: '-0.5px', display: 'block', lineHeight: 1.1 }}>TravelLens</span>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: t.textMuted, display: 'block' }}>Explorer</span>
            </div>
          </Link>

          {/* ── Search (desktop) ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: t.inputBg, border: `1px solid ${t.border}`,
            borderRadius: 999, padding: '8px 16px', flex: '0 1 220px',
          }} className="search-wrap">
            <span className="material-symbols-outlined" style={{ color: t.textMuted, fontSize: 17 }}>search</span>
            <input
              placeholder="Search trips..."
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: t.textPrimary, fontFamily: 'Manrope', width: '100%',
              }}
            />
          </div>

          {/* ── Desktop Nav Links ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-links">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`tl-nav-link${isActive(link.to) ? ' active' : ''}`}
                style={{ color: isActive(link.to) ? t.activeLink : t.textMuted }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Right Controls ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="tl-icon-btn"
              style={{ color: t.textSecond, gap: 6, padding: '7px 12px', borderRadius: 999, border: `1px solid ${t.border}`, background: t.inputBg, fontSize: 13, fontFamily: 'Manrope', fontWeight: 600, display: 'flex', alignItems: 'center' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{isDark ? 'light_mode' : 'dark_mode'}</span>
              <span style={{ fontSize: 12 }}>{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {/* Notifications */}
            <button className="tl-icon-btn" style={{ color: t.textMuted, position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
              <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, background: '#ef4444', borderRadius: '50%', border: `2px solid ${isDark ? '#111125' : '#fdfae7'}` }} />
            </button>

            {/* Log New Trip — desktop only */}
            <Link
              to="/trip-logger"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                borderRadius: 12, textDecoration: 'none', fontFamily: 'Manrope',
                fontWeight: 700, fontSize: 13, flexShrink: 0,
                background: `linear-gradient(135deg,${t.primary},${t.accent}55)`,
                border: `1px solid ${t.accent}33`,
                color: isDark ? '#e2e0fc' : '#fdfae7',
                transition: 'opacity 0.2s',
              }}
              className="log-trip-btn"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Log Trip
            </Link>

            {/* User Avatar + Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, background: 'none',
                  border: `1px solid ${t.border}`, borderRadius: 999, padding: '4px 10px 4px 4px',
                  cursor: 'pointer', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: `linear-gradient(135deg,${t.primary},${t.accent})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: 13, fontFamily: 'Manrope', flexShrink: 0,
                }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }} className="user-text">
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.textPrimary, lineHeight: 1.2 }}>{user?.name}</span>
                  <span style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.2 }}>{user?.email}</span>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: t.textMuted }}>expand_more</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <>
                  {/* backdrop */}
                  <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
                  <div className="tl-dropdown" style={{ background: t.dropBg, border: `1px solid ${t.border}` }}>
                    {/* User info header */}
                    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${t.border}` }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary }}>{user?.name}</p>
                      <p style={{ fontSize: 11, color: t.textMuted }}>{user?.email}</p>
                    </div>
                    <div style={{ padding: '8px' }}>
                      <Link to="/settings" className="tl-drop-item" style={{ color: t.textSecond, borderRadius: 10 }} onClick={() => setDropdownOpen(false)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
                        Settings
                      </Link>
                      <Link to="/insights" className="tl-drop-item" style={{ color: t.textSecond, borderRadius: 10 }} onClick={() => setDropdownOpen(false)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_awesome</span>
                        My Insights
                      </Link>
                      <div style={{ height: 1, background: t.border, margin: '6px 0' }} />
                      <button className="tl-drop-item" style={{ color: '#ef4444', borderRadius: 10 }} onClick={handleLogout}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(p => !p)}
              className="tl-icon-btn mobile-menu-btn"
              style={{ color: t.textMuted }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        {mobileOpen && (
          <div style={{
            position: 'absolute', top: 64, left: 0, right: 0,
            background: isDark ? '#111125' : '#fdfae7',
            borderBottom: `1px solid ${t.border}`,
            padding: '12px 20px 20px', zIndex: 99,
          }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="tl-mobile-link"
                style={{ color: isActive(link.to) ? t.activeLink : t.textSecond, background: isActive(link.to) ? t.accentFaded : 'transparent' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ height: 1, background: t.border, margin: '10px 0' }} />
            <button className="tl-mobile-link" style={{ color: '#ef4444', width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'none' }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-links { display: none !important; }
          .search-wrap   { display: none !important; }
          .log-trip-btn  { display: none !important; }
          .user-text     { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 901px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </>
  )
}

export default Navbar