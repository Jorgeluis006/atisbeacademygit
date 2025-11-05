export default function Footer() {
  return (
    <footer className="mt-24 border-t border-brand-pink/30 bg-white/60">
      <div className="container-padded py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-purple" aria-hidden />
            <span className="font-serif text-lg">Atisbe Academy</span>
          </div>
          <p className="mt-3 text-sm text-brand-black/70">El mundo a través de los idiomas.</p>
        </div>
        <div>
          <h4 className="font-serif font-bold">Navegación</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/quienes-somos">Quiénes somos</a></li>
            <li><a href="/cursos">Cursos</a></li>
            <li><a href="/testimonios">Testimonios</a></li>
            <li><a href="/blog">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif font-bold">Contacto</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="mailto:automatic@atisbeacademy.com">automatic@atisbeacademy.com</a></li>
            <li><a href="tel:+573227850345">+57 322 785 0345</a></li>
            <li><a href="/politicas-privacidad">Políticas de privacidad</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif font-bold">Redes</h4>
          <div className="mt-3 flex gap-3 text-sm">
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="Facebook">Facebook</a>
            <a href="#" aria-label="YouTube">YouTube</a>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-pink/20 py-4 text-center text-xs text-brand-black/60">© {new Date().getFullYear()} Atisbe Academy</div>
    </footer>
  )
}
