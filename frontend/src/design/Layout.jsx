import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from './Themecontext' // Ensure the filename case matches exactly
import Navbar from '../components/Navbar'

export default function Layout({ children, user, onLogout }) {
    // 1. Pull the theme state directly from your Context
    // 'dark' is the boolean, 'toggleDark' is the function to flip it
    const { dark, toggleDark } = useTheme()
    const navigate = useNavigate()

    const handleLogout = () => {
        if (onLogout) onLogout()
        navigate('/login')
    }

    /**
     * 2. Inject theme props into children. 
     * This ensures that any page inside the layout knows if it's dark or light.
     */
    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                isDark: dark,
                onToggleTheme: toggleDark
            })
        }
        return child
    })

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            // 3. Direct mapping: If dark is true, use the dark hex. 
            // This prevents the "opposite" theme bug.
            background: dark ? '#0a0a0a' : '#fdfae7',
            color: dark ? '#f0f0f0' : '#1c1c11',
            margin: 0,
            padding: 0,
            transition: 'background 0.3s ease, color 0.3s ease',
        }}>
            {/* ── Shared TravelLens Navbar ── */}
            <Navbar
                user={user}
                isDark={dark}
                onToggleTheme={toggleDark}
                onLogout={handleLogout}
            />

            {/* ── Page content ── */}
            <main style={{
                margin: 0,
                padding: 0,
                width: '100%',
                paddingTop: 64, // Height of your fixed navbar
                boxSizing: 'border-box',
            }}>
                {childrenWithProps}
            </main>
        </div>
    )
}