import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../design/Themecontext'

/* ── Icons ── */
const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
    }
  </svg>
)

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

/* ── Component ── */
export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const { t, dark, toggleDark } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const result = await login(formData.email, formData.password)
    if (result.success) navigate('/dashboard')
    else setError(result.error)
    setLoading(false)
  }

  const field = (key) => ({
    value: formData[key],
    onChange: e => setFormData({ ...formData, [key]: e.target.value }),
  })

  /* ── Light-mode surface tokens matched to Signup/Layout theme ── */
  const surface = dark ? '#131313' : '#fdfae7'
  const panelBg = dark ? '#1b1b1b' : '#f7f4e1'
  const inputBg = dark ? '#252525' : '#f7f4e1'
  const inputBdr = dark ? 'transparent' : 'rgba(66,71,80,0.12)'
  const textPri = dark ? '#e2e2e2' : '#1c1c11'
  const textSec = dark ? 'rgba(226,226,226,0.5)' : '#424750'
  const textMuted = dark ? 'rgba(226,226,226,0.25)' : '#727781'
  const divBdr = dark ? 'rgba(255,255,255,0.07)' : 'rgba(66,71,80,0.12)'
  const focusClr = dark ? '#00e1ab' : '#003461'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Manrope', sans-serif", background: surface, transition: 'background 0.3s, color 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;400;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .tl-input {
          width: 100%; padding: 14px 16px;
          border-radius: 12px;
          border: 1.5px solid ${inputBdr};
          background: ${inputBg};
          color: ${textPri};
          font-size: 14px; font-family: 'Manrope', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .tl-input::placeholder { color: ${textMuted}; }
        .tl-input:focus {
          outline: none;
          border-color: ${focusClr} !important;
          box-shadow: 0 0 0 3px ${dark ? 'rgba(0,225,171,0.12)' : 'rgba(59,130,246,0.15)'};
        }
        .tl-input-pwd { padding-right: 48px !important; }

        .tl-btn { transition: all 0.18s ease; cursor: pointer; }
        .tl-btn:hover { opacity: 0.88; }
        .tl-btn:active { transform: scale(0.98); }

        .tl-link { transition: color 0.18s; text-decoration: none; }
        .tl-link:hover { color: ${focusClr} !important; }

        .social-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px; border-radius: 12px;
          border: 1px solid ${divBdr};
          background: ${dark ? '#1f1f1f' : panelBg};
          color: ${textSec}; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: border-color 0.2s, background 0.2s;
        }
        .social-btn:hover { border-color: ${dark ? 'rgba(255,255,255,0.2)' : '#94a3b8'}; }

        .auth-panel { animation: slideIn 0.35s cubic-bezier(.22,1,.36,1); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }

        .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; pointer-events: none; }
        .chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px; padding: 7px 16px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
          color: rgba(255,255,255,0.75); margin: 4px;
          text-transform: uppercase; backdrop-filter: blur(8px);
        }
        .label-text {
          display: block; margin-bottom: 7px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: ${textMuted};
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${divBdr}; border-radius: 3px; }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #0f2744 0%, #1a1040 50%, #0a1628 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '60px 48px', position: 'relative', overflow: 'hidden',
        minHeight: '100vh',
      }}>
        {/* Orbs */}
        <div className="orb" style={{ width: 380, height: 380, top: '-80px', left: '-80px', background: '#00e1ab' }} />
        <div className="orb" style={{ width: 280, height: 280, bottom: '5%', right: '-60px', background: '#adc6ff' }} />
        <div className="orb" style={{ width: 180, height: 180, top: '42%', left: '62%', background: '#f97316' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
          {/* Logo mark */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, boxShadow: '0 8px 30px rgba(59,130,246,0.4)',
            }}>✈️</div>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 48, fontWeight: 700, color: 'white',
            lineHeight: 1.1, marginBottom: 8, letterSpacing: '-0.5px',
          }}>
            Navigate the <br /><em style={{ color: '#00e1ab' }}>Unknown.</em>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 36, fontWeight: 300 }}>
            Experience travel through a lens of curated intelligence.<br />Your global journey, refined by data.
          </p>

          {/* Feature chips */}
          {[
            ['📊', 'AI Travel Insights'],
            ['🗺️', 'Trip Analytics'],
            ['💸', 'Expense Tracking'],
            ['🧭', 'Personalized Recs'],
          ].map(([icon, label]) => (
            <span key={label} className="chip">{icon} {label}</span>
          ))}

          {/* Decorative image card */}
          <div style={{
            marginTop: 40,
            background: 'rgba(27,27,27,0.5)',
            backdropFilter: 'blur(20px)',
            borderRadius: 16, padding: 4,
            transform: 'rotate(-2deg)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              width: '100%', height: 180,
              borderRadius: 12, overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(0,225,171,0.15) 0%, rgba(173,198,255,0.1) 50%, rgba(139,92,246,0.15) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 56 }}>🌏</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        width: 500, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '48px 52px',
        background: surface, position: 'relative',
        borderLeft: `1px solid ${divBdr}`,
      }}>

        {/* Dark toggle */}
        <button
          onClick={toggleDark}
          className="tl-btn"
          style={{
            position: 'absolute', top: 20, right: 20,
            background: dark ? 'rgba(255,255,255,0.06)' : '#f7f4e1',
            border: `1px solid ${divBdr}`, borderRadius: 8,
            padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6,
            color: textSec, fontSize: 12, fontFamily: "'Manrope', sans-serif",
            fontWeight: 600, letterSpacing: '0.04em',
          }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}{dark ? 'Light' : 'Dark'}
        </button>

        <div className="auth-panel" style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
          {/* Heading */}
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 40, fontWeight: 700, color: textPri,
            marginBottom: 6, lineHeight: 1.1,
          }}>Welcome back</h2>
          <p style={{ fontSize: 13, color: textSec, marginBottom: 36, letterSpacing: '0.01em' }}>
            Enter your credentials to access the editorial suite.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Email */}
            <div>
              <label className="label-text">Email Address</label>
              <input
                className="tl-input"
                type="email"
                {...field('email')}
                required
                placeholder="editor@travellens.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label-text">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="tl-input tl-input-pwd"
                  type={showPwd ? 'text' : 'password'}
                  {...field('password')}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: textSec,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            {/* Remember + Forgot row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{
                    width: 14, height: 14, accentColor: focusClr,
                    borderRadius: 3, cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: 12, color: textSec }}>Remember me</span>
              </label>
              <a href="#" className="tl-link" style={{ fontSize: 12, fontWeight: 700, color: focusClr }}>
                Forgot password?
              </a>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '11px 14px', borderRadius: 10,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444', fontSize: 13,
              }}>{error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="tl-btn"
              style={{
                padding: '14px', borderRadius: 999,
                border: 'none',
                background: dark
                  ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
                  : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: 'white', fontSize: 14, fontWeight: 700,
                fontFamily: "'Manrope', sans-serif",
                letterSpacing: '0.04em',
                boxShadow: dark
                  ? '0 4px 20px rgba(139,92,246,0.35)'
                  : '0 4px 16px rgba(59,130,246,0.35)',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight /></>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: divBdr }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: textMuted, textTransform: 'uppercase' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: divBdr }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="social-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </button>
            <button className="social-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" opacity="0.65">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Demo credentials */}
          <div style={{
            marginTop: 24, padding: '14px 16px', borderRadius: 12,
            background: dark ? 'rgba(0,225,171,0.04)' : '#f7f4e1',
            border: `1px solid ${dark ? 'rgba(0,225,171,0.12)' : divBdr}`,
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: dark ? '#00e1ab' : textSec,
              marginBottom: 8,
            }}>Demo Credentials</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <p style={{ fontSize: 10, color: textMuted, marginBottom: 3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email</p>
                <p style={{ fontSize: 12, fontFamily: 'monospace', color: textPri }}>john@example.com</p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: textMuted, marginBottom: 3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Password</p>
                <p style={{ fontSize: 12, fontFamily: 'monospace', color: textPri }}>password123</p>
              </div>
            </div>
          </div>

          {/* Sign up link */}
          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: textSec }}>
            Don't have an account?{' '}
            <Link to="/signup" className="tl-link" style={{ color: focusClr, fontWeight: 700 }}>
              Request access
            </Link>
          </p>
        </div>

        {/* Footer */}
        <footer style={{
          position: 'absolute', bottom: 20, left: 0, width: '100%',
          padding: '0 52px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 10, color: textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>© 2024 TravelLens Editorial</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy', 'Terms'].map(l => (
              <a key={l} href="#" className="tl-link" style={{ fontSize: 10, color: textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}