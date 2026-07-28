import { Link, useNavigate } from 'react-router-dom'
import { useEffect }          from 'react'
import { useAuth }            from '@/hooks/useAuth'
import { useSettingsStore }   from '@/store/settingsStore'
import { ROUTES }             from '@/constants/routes'
import Button                 from '@/components/ui/Button'

export default function Navbar() {
  const { user, isAuth, logout } = useAuth()
  const { theme, toggleTheme }   = useSettingsStore()
  const nav = useNavigate()

  // Apply theme to html element
  useEffect(() => {
    const html = document.documentElement
    if (theme === 'light') html.classList.add('light')
    else                   html.classList.remove('light')
  }, [theme])

  return (
    <nav style={{
      background:   'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding:      '12px 24px',
      display:      'flex',
      alignItems:   'center',
      gap:          24,
      position:     'sticky',
      top:          0,
      zIndex:       100,
      backdropFilter: 'blur(8px)',
    }}>
      {/* Logo */}
      <Link to={ROUTES.HOME} style={{
        fontSize:   20,
        fontWeight: 900,
        background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor:  'transparent',
        textDecoration: 'none',
        flexShrink: 0,
      }}>
        🎵 MusicLearner
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
        {[
          { to: ROUTES.LESSONS,     label: 'Lessons'     },
          { to: ROUTES.LEADERBOARD, label: 'Leaderboard' },
          ...(isAuth ? [{ to: ROUTES.DASHBOARD, label: 'Dashboard' }] : []),
        ].map(link => (
          <Link key={link.to} to={link.to} className="btn-ghost" style={{ textDecoration: 'none' }}>
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width:        36,
            height:       36,
            borderRadius: '50%',
            border:       '1px solid var(--border)',
            background:   'var(--surface2)',
            cursor:       'pointer',
            fontSize:     18,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            transition:   'all 0.2s',
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {isAuth ? (
          <>
            {/* XP + Level */}
            <div style={{
              display:      'flex',
              alignItems:   'center',
              gap:          8,
              background:   'var(--surface2)',
              border:       '1px solid var(--border)',
              borderRadius: 8,
              padding:      '6px 12px',
              fontSize:     13,
            }}>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>⭐ {user?.totalXP}</span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span style={{ color: '#a855f7', fontWeight: 700 }}>Lv.{user?.level}</span>
            </div>

            <Link to={ROUTES.PROFILE} style={{
              textDecoration: 'none',
              fontWeight:     600,
              fontSize:       14,
              color:          '#a855f7',
            }}>
              {user?.username}
            </Link>

            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost"   size="sm" onClick={() => nav(ROUTES.LOGIN)}>
              Login
            </Button>
            <Button variant="primary" size="sm" onClick={() => nav(ROUTES.REGISTER)}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}
