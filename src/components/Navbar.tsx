import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { me } from '../services/api'

const navItems = [
  { to: '/', label: 'Inicio' },
  { to: '/quienes-somos', label: 'Quiénes somos' },
  { to: '/cursos', label: 'Cursos' },
  { to: '/testimonios', label: 'Testimonios' },
  { to: '/blog', label: 'Blog' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/pago', label: 'Pago' },
  { to: '/tienda', label: 'Tienda' },
]

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isTeacher, setIsTeacher] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  // For now, force light theme to avoid visibility issues reported by user
  // Lightweight role check only
  useEffect(() => { (async () => { try { const u = await me(); setIsAdmin(!!u && u.role === 'admin'); setIsTeacher(!!u && u.role === 'teacher') } catch {} })() }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }, [])

  // No logout in navbar per request
  return (
  <header className="sticky top-0 z-50 bg-brand-surface/80 backdrop-blur border-b border-brand-pink/20">
      <div className="container-padded flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-brand-purple" aria-hidden />
          <span className="font-serif text-xl text-brand-black">Atisbe</span>
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple dark:text-white/80 dark:hover:text-white'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/zona-estudiantes" className="btn-primary">Zona de estudiantes</Link>
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`
              }
            >Admin</NavLink>
          )}
          {isTeacher && (
            <NavLink
              to="/profesor"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`
              }
            >Profesor</NavLink>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-brand-black/10 bg-white shadow-soft"
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-black">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-black/10 bg-white/95 backdrop-blur">
          <div className="container-padded py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-2 py-2 rounded-md ${isActive ? 'text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/zona-estudiantes" onClick={() => setMobileOpen(false)} className="btn-primary w-full">Zona de estudiantes</Link>
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={({ isActive }) => `block px-2 py-2 rounded-md ${isActive ? 'text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`}>Admin</NavLink>
            )}
            {isTeacher && (
              <NavLink to="/profesor" onClick={() => setMobileOpen(false)} className={({ isActive }) => `block px-2 py-2 rounded-md ${isActive ? 'text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`}>Profesor</NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
