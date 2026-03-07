import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }) => {
    const [dark, setDark] = useState(false)
    const toggleDark = () => setDark(d => !d)

    const t = {
        dark,
        bg: dark ? '#080f1e' : '#f0f4f8',
        sidebar: dark ? '#0d1526' : '#ffffff',
        card: dark ? '#131f35' : '#ffffff',
        cardHover: dark ? '#1a2840' : '#f8fafc',
        border: dark ? '#1e2f4a' : '#e2e8f0',
        textPrimary: dark ? '#f0f4ff' : '#0f172a',
        textSecondary: dark ? '#8899bb' : '#64748b',
        textMuted: dark ? '#3d5070' : '#94a3b8',
        input: dark ? '#0d1526' : '#ffffff',
        inputBorder: dark ? '#1e2f4a' : '#cbd5e1',
        modalBg: dark ? '#131f35' : '#ffffff',
        // brand
        blue: '#3b82f6',
        orange: '#f97316',
        purple: '#8b5cf6',
        green: '#10b981',
        red: '#ef4444',
        amber: '#f59e0b',
    }

    return (
        <ThemeContext.Provider value={{ t, dark, toggleDark }}>
            {children}
        </ThemeContext.Provider>
    )
}