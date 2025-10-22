import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { me, logout } from '../services/api'

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
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isTeacher, setIsTeacher] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as any) || 'light')
  useEffect(() => { (async () => { try { const u = await me(); setIsLoggedIn(!!u); setIsAdmin(!!u && u.role === 'admin'); setIsTeacher(!!u && u.role === 'teacher') } catch { setIsLoggedIn(false) } })() }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  async function handleLogout() {
    try { await logout() } catch {}
    setIsLoggedIn(false)
    setIsAdmin(false)
    setIsTeacher(false)
    navigate('/', { replace: true })
  }
  return (
  <header className="sticky top-0 z-50 bg-brand-surface/80 dark:bg-black/40 backdrop-blur border-b border-brand-pink/20 dark:border-white/10">
      <div className="container-padded flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-brand-purple" aria-hidden />
          <span className="font-serif text-xl text-brand-black">Atisbe</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`
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
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-sm font-medium text-brand-black/80 hover:text-brand-purple dark:text-white/80 dark:hover:text-white">{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</button>
          {isLoggedIn && (
            <button onClick={handleLogout} className="text-sm font-medium text-brand-black/80 hover:text-brand-purple">Salir</button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
