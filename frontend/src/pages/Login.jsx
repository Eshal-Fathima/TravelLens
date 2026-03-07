import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../design/Themecontext'

const EyeIcon = ({ open }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
    }
  </svg>
)

const SunIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
const MoonIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>

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
    onChange: e => setFormData({ ...formData, [key]: e.target.value })
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif", background: t.bg, transition: 'background 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .tl-input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .tl-btn { transition: all 0.18s ease; cursor: pointer; }
        .tl-btn:hover { opacity: 0.88; }
        .tl-link { transition: color 0.18s; }
        .tl-link:hover { color: #3b82f6 !important; }
        .auth-panel { animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      {/* Left decorative panel */}
      <div style={{
        flex: 1, background: 'linear-gradient(135deg, #0f2744 0%, #1a1040 50%, #0a1628 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: 60, position: 'relative', overflow: 'hidden',
        minHeight: '100vh',
      }}>
        {/* Orbs */}
        {[
          { w: 300, h: 300, top: '-80px', left: '-80px', bg: 'rgba(59,130,246,0.12)' },
          { w: 200, h: 200, bottom: '60px', right: '-40px', bg: 'rgba(139,92,246,0.1)' },
          { w: 150, h: 150, top: '40%', left: '60%', bg: 'rgba(249,115,22,0.08)' },
        ].map((o, i) => (
          <div key={i} style={{ position: 'absolute', width: o.w, height: o.h, borderRadius: '50%', background: o.bg, top: o.top, bottom: o.bottom, left: o.left, right: o.right, filter: 'blur(40px)', pointerEvents: 'none' }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 360 }}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 8px 30px rgba(59,130,246,0.4)' }}>✈️</div>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: 'white', marginBottom: 12, letterSpacing: '-0.5px' }}>TravelLens</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 40 }}>Your AI-powered travel companion. Log trips, track expenses, and discover your travel personality.</p>

          {/* Feature chips */}
          {['📊 AI Travel Insights', '🗺️ Trip Analytics', '💸 Expense Tracking', '🧭 Personalized Recommendations'].map(f => (
            <div key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '4px', backdropFilter: 'blur(8px)' }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 52px', background: t.sidebar, position: 'relative' }}>
        {/* Dark toggle */}
        <button onClick={toggleDark} className="tl-btn" style={{ position: 'absolute', top: 20, right: 20, background: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', border: `1px solid ${t.border}`, borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, color: t.textSecondary, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
          {dark ? <SunIcon /> : <MoonIcon />}{dark ? 'Light' : 'Dark'}
        </button>

        <div className="auth-panel">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: t.textPrimary, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 32 }}>Sign in to your TravelLens account</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, letterSpacing: '0.3px', display: 'block', marginBottom: 6 }}>Email address</label>
              <input className="tl-input" type="email" {...field('email')} required placeholder="you@example.com" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${t.inputBorder}`, background: t.input, color: t.textPrimary, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }} />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, letterSpacing: '0.3px', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="tl-input" type={showPwd ? 'text' : 'password'} {...field('password')} required placeholder="Your password" style={{ width: '100%', padding: '11px 42px 11px 14px', borderRadius: 10, border: `1.5px solid ${t.inputBorder}`, background: t.input, color: t.textPrimary, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.textSecondary }}>
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 13 }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="tl-btn" style={{ padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 16px rgba(59,130,246,0.35)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 10, background: dark ? 'rgba(255,255,255,0.04)' : '#f8fafc', border: `1px solid ${t.border}` }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, marginBottom: 4 }}>Demo credentials</p>
            <p style={{ fontSize: 12, color: t.textMuted }}>Email: john@example.com · Password: password123</p>
          </div>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: t.textSecondary }}>
            Don't have an account?{' '}
            <Link to="/signup" className="tl-link" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}