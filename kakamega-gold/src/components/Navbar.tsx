import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/',           label: 'Home'               },
  { to: '/geological', label: 'Geological Analysis' },
  { to: '/investor',   label: 'Investor View'       },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: '#0d0900',
        borderBottom: '1px solid rgba(92,61,0,0.5)',
        boxShadow: '0 1px 0 rgba(255,179,0,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: 1400, margin: '0 auto',
          padding: '0 24px',
          height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>⛏️</span>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 20,
            fontWeight: 700,
            color: '#FFB300',
            letterSpacing: '0.02em',
          }}>
            KakamegaGold
          </span>
        </NavLink>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}
             className="hidden-mobile">
          {LINKS.map(({ to, label }) => {
            const isActive = pathname === to
            return (
              <NavLink
                key={to}
                to={to}
                className={`nav-link${isActive ? ' active' : ''}`}
              >
                {label}
              </NavLink>
            )
          })}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#FFB300', fontSize: 24, lineHeight: 1,
            display: 'none',
          }}
          className="show-mobile"
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div style={{
          background: '#0d0900',
          borderTop: '1px solid #2a1f00',
          padding: '12px 24px 16px',
        }}>
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={`nav-link${pathname === to ? ' active' : ''}`}
              style={{ display: 'block', padding: '10px 0', fontSize: 15 }}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
