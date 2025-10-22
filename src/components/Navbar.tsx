import { Link, NavLink } from 'react-router-dom'

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
  return (
    <header className="sticky top-0 z-50 bg-brand-surface/80 backdrop-blur border-b border-brand-pink/20">
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
        </nav>
      </div>
    </header>
  )
}

export default Navbar
