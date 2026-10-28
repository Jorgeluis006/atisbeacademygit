import { Link, NavLink } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { me, getExams, getCorporativo, type Exam, type CorporativoItem } from '../services/api'

type NavChild = { to: string; label: string }
type NavItem = { to: string; label: string; children?: NavChild[] }

// Exámenes y corporativo se listan dinámicamente; Cursos mantiene un enlace directo para evitar un menú extenso.
function buildNavItems(exams: Exam[], corporativo: CorporativoItem[]): NavItem[] {
  const examChildren: NavChild[] = [
    { to: '/examenes', label: 'Ver todos los exámenes' },
    ...exams
      .filter(e => e.is_published !== false)
      .map(e => ({ to: `/examenes/${e.slug}`, label: e.title })),
  ]

  const corporativoChildren: NavChild[] = [
    { to: '/corporativo', label: 'Ver todo corporativo' },
    ...corporativo
      .filter(c => c.is_published !== false)
      .map(c => ({ to: `/corporativo?section=${c.slug || ''}`, label: c.title })),
  ]

  return [
    { to: '/cursos', label: 'Cursos' },
    { to: '/corporativo', label: 'Corporativo', children: corporativoChildren.length > 1 ? corporativoChildren : undefined },
    { to: '/examenes', label: 'Exámenes', children: examChildren.length > 1 ? examChildren : undefined },
    {
      to: '/blog',
      label: 'Blog',
      children: [
        { to: '/blog?category=consejos', label: 'Consejos' },
        { to: '/blog?category=gramatica', label: 'Gramática' },
        { to: '/blog?category=vocabulario', label: 'Vocabulario' },
        { to: '/blog?category=cultura', label: 'Cultura' },
        { to: '/blog?category=recursos', label: 'Recursos' },
      ],
    },
    {
      to: '/tienda',
      label: 'Tienda',
      children: [
        { to: '/pago', label: 'Pago' },
        { to: '/tienda?category=curso', label: 'Cursos' },
        { to: '/tienda?category=material', label: 'Materiales' },
        { to: '/tienda?category=club', label: 'Clubs' },
        { to: '/tienda?category=taller', label: 'Talleres' },
      ],
    },
    { to: '/quienes-somos', label: 'Quiénes somos' },
  ]
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  )
}

function DesktopNavItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  if (!item.children) {
    return (
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          `text-sm font-medium transition-colors ${isActive ? 'text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`
        }
      >
        {item.label}
      </NavLink>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true) }}
      onMouseLeave={scheduleClose}
    >
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          `flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`
        }
        onClick={() => setOpen(false)}
      >
        {item.label}
        <ChevronIcon open={open} />
      </NavLink>
      {open && (
        <div className="absolute top-full left-0 pt-3">
          <div className="min-w-[240px] max-h-80 overflow-y-auto rounded-xl border border-brand-sand/60 bg-brand-cream py-2 shadow-xl">
            {item.children.map((child) => (
              <Link
                key={child.to}
                to={child.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-brand-black/80 transition-colors hover:bg-brand-purple/10 hover:text-brand-purple"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MobileNavItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false)

  if (!item.children) {
    return (
      <NavLink
        to={item.to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `block rounded-md px-2 py-2 transition-colors ${isActive ? 'bg-brand-purple/10 text-brand-purple' : 'text-brand-black/80 hover:bg-brand-purple/5 hover:text-brand-purple'}`
        }
      >
        {item.label}
      </NavLink>
    )
  }

  return (
    <div>
      <div className="flex items-center">
        <NavLink
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `block flex-1 rounded-md px-2 py-2 transition-colors ${isActive ? 'bg-brand-purple/10 text-brand-purple' : 'text-brand-black/80 hover:bg-brand-purple/5 hover:text-brand-purple'}`
          }
        >
          {item.label}
        </NavLink>
        <button
          type="button"
          aria-label={`Mostrar opciones de ${item.label}`}
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className="px-2 py-2 text-brand-black/60 hover:text-brand-purple"
        >
          <ChevronIcon open={open} />
        </button>
      </div>
      {open && (
        <div className="ml-2 space-y-1 border-l border-brand-sand pl-4">
          {item.children.map((child) => (
            <Link
              key={child.to}
              to={child.to}
              onClick={onNavigate}
              className="block rounded-md px-2 py-2 text-sm text-brand-black/70 transition-colors hover:text-brand-purple"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isTeacher, setIsTeacher] = useState(false)
  const [isCoordinator, setIsCoordinator] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [exams, setExams] = useState<Exam[]>([])
  const [corporativo, setCorporativo] = useState<CorporativoItem[]>([])
  // For now, force light theme to avoid visibility issues reported by user
  // Lightweight role check only
  useEffect(() => { (async () => { try { const u = await me(); setIsAdmin(!!u && u.role === 'admin'); setIsTeacher(!!u && u.role === 'teacher'); setIsCoordinator(!!u && u.role === 'coordinator') } catch {} })() }, [])

  useEffect(() => {
    (async () => {
      try {
        const [examsData, corporativoData] = await Promise.all([getExams(), getCorporativo()])
        setExams(examsData)
        setCorporativo(corporativoData)
      } catch {
        // Si falla, el menú simplemente no muestra submenús para Cursos/Exámenes/Corporativo
      }
    })()
  }, [])

  const navItems = useMemo(() => buildNavItems(exams, corporativo), [exams, corporativo])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }, [])

  // No logout in navbar per request
  return (
  <header className="sticky top-0 z-50 border-b border-brand-sand/50 bg-brand-cream/95 shadow-sm backdrop-blur-xl">
      <div className="container-padded flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logos-09.png" alt="Atisbe Academy" className="h-10 w-auto max-w-[220px] object-contain" />
        </Link>
        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navItems.map((item) => (
            <DesktopNavItem key={item.to} item={item} />
          ))}
          <Link to="/zona-estudiantes" className="inline-flex items-center justify-center rounded-lg border border-brand-purple px-5 py-2.5 text-sm font-semibold text-brand-purple transition-colors hover:bg-brand-purple hover:text-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2">Soy estudiante</Link>
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`
              }
            >Admin</NavLink>
          )}
          {isTeacher && (
            <NavLink
              to="/profesor"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`
              }
            >Profesor</NavLink>
          )}
          {isCoordinator && (
            <NavLink
              to="/coordinador"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`
              }
            >Coordinador</NavLink>
          )}
        </nav>

        {/* Mobile/Tablet hamburger */}
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-sand bg-brand-cream text-brand-purple shadow-soft transition-colors hover:bg-brand-beige lg:hidden"
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <MobileNavItem key={item.to} item={item} onNavigate={() => setMobileOpen(false)} />
            ))}
            <Link to="/zona-estudiantes" onClick={() => setMobileOpen(false)} className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-brand-purple px-5 py-3 text-sm font-semibold text-brand-purple transition-colors hover:bg-brand-purple hover:text-brand-cream">Soy estudiante</Link>
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={({ isActive }) => `block rounded-md px-2 py-2 transition-colors ${isActive ? 'bg-brand-purple/10 text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`}>Admin</NavLink>
            )}
            {isTeacher && (
              <NavLink to="/profesor" onClick={() => setMobileOpen(false)} className={({ isActive }) => `block rounded-md px-2 py-2 transition-colors ${isActive ? 'bg-brand-purple/10 text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`}>Profesor</NavLink>
            )}
            {isCoordinator && (
              <NavLink to="/coordinador" onClick={() => setMobileOpen(false)} className={({ isActive }) => `block rounded-md px-2 py-2 transition-colors ${isActive ? 'bg-brand-purple/10 text-brand-purple' : 'text-brand-black/80 hover:text-brand-purple'}`}>Coordinador</NavLink>
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
      <div className="fixed right-0 top-0 z-50 h-full w-full translate-x-0 transform border-l border-brand-sand/60 bg-brand-cream text-brand-black shadow-soft transition-transform duration-300 ease-out sm:w-72">
        <div className="flex items-center justify-between border-b border-brand-sand/60 p-3">
          <span className="font-serif text-lg text-brand-black">Menú</span>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-brand-black/80 hover:bg-brand-beige hover:text-brand-purple" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="overflow-y-auto px-4" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Navbar
