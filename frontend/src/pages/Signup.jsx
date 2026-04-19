import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../design/Themecontext'

// ─── Theme tokens (same pattern as TripLogger) ────────────────────────────────
const themes = {
  light: {
    bg: '#fdfae7',
    surface: '#fdfae7',
    card: '#ffffff',
    cardLow: '#f7f4e1',
    cardHigh: '#ece9d6',
    cardHighest: '#e6e3d0',
    border: 'rgba(66,71,80,0.12)',
    borderRing: '#c2c6d1',
    textPrimary: '#1c1c11',
    textSecond: '#424750',
    textMuted: '#727781',
    primary: '#003461',
    primaryFaded: '#004b8718',
    primaryFixed: '#d3e4ff',
    primaryContainer: '#004b87',
    accent: '#1b6d24',
    inputBg: '#f7f4e1',
    inputFocus: '#fdfae7',
    // left panel
    leftBg: '#f7f4e1',
    blob1: 'rgba(163,249,156,0.5)',
    blob2: 'rgba(211,228,255,0.5)',
    blob3: 'rgba(255,219,210,0.5)',
    benefitIconBg: '#ffffff',
    benefitIconShadow: '0 2px 8px rgba(28,28,17,0.08)',
  },
  dark: {
    bg: '#0a0a0a',
    surface: '#131313',
    card: '#1a1a1a',
    cardLow: '#1b1b1b',
    cardHigh: '#2a2a2a',
    cardHighest: '#353535',
    border: 'rgba(255,255,255,0.08)',
    borderRing: 'rgba(255,255,255,0.1)',
    textPrimary: '#e2e2e2',
    textSecond: '#b0b0b0',
    textMuted: '#666666',
    primary: '#a3c9ff',
    primaryFaded: '#a3c9ff14',
    primaryFixed: '#a3c9ff20',
    primaryContainer: '#0d1f35',
    accent: '#4ae183',
    inputBg: '#2a2a2a',
    inputFocus: '#353535',
    // left panel — midnight gradient
    leftBg: 'linear-gradient(135deg,#0f2744 0%,#0a1628 100%)',
    blob1: 'rgba(79,70,229,0.2)',
    blob2: 'rgba(255,191,0,0.15)',
    blob3: 'rgba(139,92,246,0.12)',
    benefitIconBg: 'rgba(255,255,255,0.05)',
    benefitIconShadow: 'none',
  },
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
    }
  </svg>
)

const BENEFITS = [
  { icon: '🌍', title: 'Track every adventure', desc: 'Real-time mapping of your global footsteps.' },
  { icon: '📈', title: 'Discover travel patterns', desc: 'Deep insights into your preferred destination types.' },
  { icon: '💡', title: 'Get AI recommendations', desc: 'Personalized paths based on your travel DNA.' },
  { icon: '🏆', title: 'Build your travel legacy', desc: 'A permanent archive for your life\'s greatest stories.' },
]

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signup } = useAuth()
  const { dark: ctxDark } = useTheme()
  const navigate = useNavigate()

  // local isDark synced from context
  const isDark = ctxDark ?? false
  const t = themes[isDark ? 'dark' : 'light']

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    const result = await signup(formData.name, formData.email, formData.password)
    if (result.success) navigate('/dashboard')
    else setError(result.error)
    setLoading(false)
  }

  const field = (key) => ({
    value: formData[key],
    onChange: e => setFormData({ ...formData, [key]: e.target.value }),
  })

  const inputBase = {
    width: '100%', padding: '14px 18px', borderRadius: 14,
    background: t.inputBg,
    border: 'none', outline: 'none',
    boxShadow: `0 0 0 1px ${t.borderRing}`,
    color: t.textPrimary, fontSize: 14,
    fontFamily: 'Manrope, sans-serif',
    transition: 'box-shadow 0.18s, background 0.18s',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Lora:ital,wght@0,700;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sg-input:focus {
          box-shadow: 0 0 0 2px ${themes.light.primary} !important;
          background: ${themes.light.inputFocus} !important;
        }
        .sg-input-dark:focus {
          box-shadow: 0 0 0 2px #a3c9ff !important;
          background: ${themes.dark.inputFocus} !important;
        }
        .sg-btn { transition: all 0.18s ease; cursor: pointer; }
        .sg-btn:hover { transform: scale(1.01); opacity: 0.9; }
        .sg-btn:active { transform: scale(0.98); }
        .sg-benefit { transition: transform 0.2s; }
        .sg-benefit:hover { transform: translateX(4px); }
        .sg-panel { animation: sg-in 0.35s ease both; }
        @keyframes sg-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Manrope, sans-serif', overflow: 'hidden' }}>

        {/* ── Left Panel (60%) ── */}
        <section style={{
          width: '60%', minHeight: '100vh',
          background: isDark
            ? 'linear-gradient(135deg,#0f2744 0%,#0a1628 100%)'
            : t.leftBg,
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '64px',
        }}>
          {/* decorative blobs */}
          {isDark ? (
            <>
              <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-5%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,191,0,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '50%', left: '55%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
            </>
          ) : (
            <>
              <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: 500, height: 500, borderRadius: '50%', background: 'rgba(163,249,156,0.45)', filter: 'blur(80px)', opacity: 0.5, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-120px', right: '80px', width: 600, height: 600, borderRadius: '50%', background: 'rgba(211,228,255,0.5)', filter: 'blur(80px)', opacity: 0.5, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: '50%', left: '33%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,219,210,0.5)', filter: 'blur(80px)', opacity: 0.5, pointerEvents: 'none' }} />
            </>
          )}

          {/* content */}
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
            <h1 style={{
              fontSize: 'clamp(44px,5vw,72px)', fontWeight: 700,
              fontFamily: 'Lora, serif', fontStyle: 'italic',
              color: isDark ? '#e2e2e2' : t.primary,
              letterSpacing: '-2px', lineHeight: 1.1, margin: '0 0 20px',
            }}>
              Start Your<br />Journey
            </h1>
            <p style={{
              fontSize: 17, color: isDark ? 'rgba(255,255,255,0.55)' : t.textSecond,
              lineHeight: 1.75, margin: '0 0 44px', maxWidth: 420,
            }}>
              Join thousands of travelers who are mapping their memories and discovering the world through an editorial lens.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {BENEFITS.map((b) => (
                <div key={b.title} className="sg-benefit" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: t.benefitIconBg,
                    boxShadow: t.benefitIconShadow,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>{b.icon}</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#e2e2e2' : t.textPrimary, margin: '0 0 3px' }}>{b.title}</p>
                    <p style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.45)' : t.textMuted, margin: 0 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* decorative rotated journal image — light only */}
          {!isDark && (
            <div style={{
              position: 'absolute', bottom: 40, right: 40,
              width: 140, height: 180, borderRadius: 16,
              overflow: 'hidden', transform: 'rotate(3deg)',
              boxShadow: '0 20px 60px rgba(28,28,17,0.15)',
              border: '6px solid #fff',
              background: t.cardHigh,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48,
            }}>📖</div>
          )}
        </section>

        {/* ── Right Panel — Form (40%) ── */}
        <section style={{
          width: '40%', minHeight: '100vh',
          background: isDark ? '#131313' : t.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 52px',
          position: 'relative',
          boxShadow: isDark ? '-20px 0 60px rgba(0,0,0,0.3)' : '-20px 0 60px rgba(0,0,0,0.02)',
          overflowY: 'auto',
        }}>
          <div className="sg-panel" style={{ width: '100%', maxWidth: 420 }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontSize: 34, fontWeight: 700,
                fontFamily: 'Lora, serif',
                color: t.textPrimary, margin: '0 0 8px', letterSpacing: '-0.5px',
              }}>Create your account</h2>
              <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>
                Start documenting your travel adventures
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Full Name */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 7 }}>
                  Full Name
                </label>
                <input
                  className={isDark ? 'sg-input-dark' : 'sg-input'}
                  type="text" {...field('name')} required
                  placeholder="Alexander Humboldt"
                  style={inputBase}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 7 }}>
                  Email Address
                </label>
                <input
                  className={isDark ? 'sg-input-dark' : 'sg-input'}
                  type="email" {...field('email')} required
                  placeholder="explorer@travellens.io"
                  style={inputBase}
                />
              </div>

              {/* Password + Confirm — 2 col */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 7 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className={isDark ? 'sg-input-dark' : 'sg-input'}
                      type={showPwd ? 'text' : 'password'}
                      {...field('password')} required minLength={6}
                      placeholder="••••••••"
                      style={{ ...inputBase, paddingRight: 42 }}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted,
                    }}><EyeIcon open={showPwd} /></button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted, display: 'block', marginBottom: 7 }}>
                    Confirm
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className={isDark ? 'sg-input-dark' : 'sg-input'}
                      type={showConfirm ? 'text' : 'password'}
                      {...field('confirmPassword')} required minLength={6}
                      placeholder="••••••••"
                      style={{ ...inputBase, paddingRight: 42 }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted,
                    }}><EyeIcon open={showConfirm} /></button>
                  </div>
                </div>
              </div>

              {/* Password match indicator */}
              {formData.confirmPassword && (
                <p style={{
                  fontSize: 12, margin: '-6px 0 0',
                  color: formData.password === formData.confirmPassword ? '#10b981' : '#ef4444',
                }}>
                  {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}

              {/* Terms */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <input type="checkbox" required id="terms" style={{ marginTop: 3, accentColor: t.primary, cursor: 'pointer' }} />
                <label htmlFor="terms" style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5, cursor: 'pointer' }}>
                  I agree to the{' '}
                  <a href="#" style={{ color: t.primary, fontWeight: 700, textDecoration: 'none' }}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" style={{ color: t.primary, fontWeight: 700, textDecoration: 'none' }}>Privacy Policy</a>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444', fontSize: 13,
                }}>{error}</div>
              )}

              {/* Submit */}
              <button
                type="submit" disabled={loading} className="sg-btn"
                style={{
                  padding: '15px', borderRadius: 14, border: 'none',
                  background: isDark
                    ? 'linear-gradient(135deg,#8b5cf6,#3b82f6)'
                    : `linear-gradient(135deg,${t.primary},${t.primaryContainer})`,
                  color: '#fff', fontSize: 15, fontWeight: 700,
                  fontFamily: 'Manrope, sans-serif',
                  boxShadow: isDark
                    ? '0 6px 24px rgba(139,92,246,0.35)'
                    : `0 6px 24px rgba(0,52,97,0.2)`,
                  opacity: loading ? 0.7 : 1, marginTop: 4,
                  width: '100%',
                }}
              >
                {loading ? 'Creating account…' : 'Create account →'}
              </button>
            </form>

            {/* Divider + OAuth */}
            <div style={{ position: 'relative', margin: '28px 0', textAlign: 'center' }}>
              <div style={{ height: 1, background: t.border, position: 'absolute', top: '50%', left: 0, right: 0 }} />
              <span style={{
                position: 'relative', background: isDark ? '#131313' : t.bg,
                padding: '0 14px', fontSize: 10, fontWeight: 700,
                letterSpacing: '2px', textTransform: 'uppercase', color: t.textMuted,
              }}>Or continue with</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              {[{ icon: '🌐', label: 'Google' }, { icon: '🍎', label: 'Apple' }].map(p => (
                <button key={p.label} type="button" className="sg-btn" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '13px', borderRadius: 12,
                  background: isDark ? t.cardLow : t.cardLow,
                  border: `1px solid ${t.border}`,
                  color: t.textPrimary, fontSize: 13, fontWeight: 600,
                  fontFamily: 'Manrope, sans-serif',
                }}>
                  <span style={{ fontSize: 18 }}>{p.icon}</span> {p.label}
                </button>
              ))}
            </div>

            {/* Sign in link */}
            <p style={{ textAlign: 'center', fontSize: 14, color: t.textMuted }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: t.primary, fontWeight: 700, textDecoration: 'none' }}>
                Log in
              </Link>
            </p>

          </div>
        </section>

      </div>
    </>
  )
}