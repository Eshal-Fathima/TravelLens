import React from 'react'
import { useTheme } from '../design/Themecontext'

const themes = {
  light: {
    bg: '#fdfae7',
    textPrimary: '#1c1c11',
    textMuted: '#727781',
  },
  dark: {
    bg: '#0a0a0a',
    textPrimary: '#f0f0f0',
    textMuted: '#666666',
  }
}

const Settings = () => {
  const { dark } = useTheme()
  const t = themes[dark ? 'dark' : 'light']

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: t.bg, 
      color: t.textPrimary,
      fontFamily: 'Manrope, sans-serif',
      padding: '40px'
    }}>
      <h1 style={{ fontSize: '32px', fontWeight: 900 }}>Settings Page</h1>
      <p style={{ color: t.textMuted }}>Manage your profile and application preferences here.</p>
    </div>
  )
}

export default Settings
