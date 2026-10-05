import { useState } from 'react'
import { NavLink } from 'react-router-dom'

function Header() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('portfolio-theme')
      if (savedTheme === 'dark') {
        document.body.classList.add('dark')
        return true
      }
      document.body.classList.remove('dark')
    }
    return false
  })
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.body.classList.add('dark')
      localStorage.setItem('portfolio-theme', 'dark')
    } else {
      document.body.classList.remove('dark')
      localStorage.setItem('portfolio-theme', 'light')
    }
  }

  const closeMenu = () => setMenuOpen(false)

  // Streamlined navigation containing only Home, Projects, and Contact
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Projects', path: '/projects' },
    { label: 'Contact', path: '/contact' },
  ]

  return (
    <header className="site-header">
      <div className="nav-container">
        {/* Brand Logo */}
        <NavLink to="/" className="brand-link" onClick={closeMenu}>
          <div className="brand-badge">JV</div>
          <div className="brand-info">
            <span className="brand-name">Jemit Vaghasiya</span>
            <span className="brand-sub">Software Developer</span>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <nav>
          <ul className="nav-menu">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? 'nav-link-item active' : 'nav-link-item'
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action Controls */}
        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={`mobile-drawer-overlay ${menuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      />
      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="brand-link">
            <div className="brand-badge">JV</div>
            <span className="brand-name">Navigation</span>
          </div>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <ul className="mobile-nav-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? 'mobile-nav-item active' : 'mobile-nav-item'
                }
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}

export default Header
