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
  <header className="sticky top-0 z-50 bg-brand-surface border-b border-brand-pink/20">
      <div className="container-padded flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logoheader.png" alt="Atisbe Logo" className="h-16 w-auto" />
        </Link>
        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
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

        {/* Mobile/Tablet hamburger */}
        <button
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-brand-black/10 bg-white shadow-soft"
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

      {/* Mobile drawer + overlay */}
      {/* Lock scroll and handle Escape */}
      {mobileOpen && (
        <MobileDrawer onClose={() => setMobileOpen(false)}>
          <div className="py-4 space-y-1">
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
        </MobileDrawer>
      )}
    </header>
  )
}

function MobileDrawer({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])
  return (
    <div className="lg:hidden">
      {/* overlay */}
  <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      {/* drawer */}
      <div className="fixed top-0 right-0 h-full bg-white z-50 shadow-soft border-l border-brand-black/10 transform transition-transform duration-300 ease-out translate-x-0 w-full sm:w-72">
        <div className="p-3 border-b border-brand-black/10 flex items-center justify-between">
          <span className="font-serif text-lg">Menú</span>
          <button className="rounded-md w-8 h-8 inline-flex items-center justify-center hover:text-brand-purple" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="px-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Navbar
