export default function Footer() {
  return (
    <footer className="mt-24 bg-purple-700 text-white">
  <div className="container-padded py-12">
        {/* Logo centrado arriba */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <span className="font-bold text-xl" style={{ color: '#B872DB' }}>A</span>
            </div>
            <span className="font-serif text-3xl font-bold" style={{ color: '#fffef1' }}>Atisbe Academy</span>
          </div>
          <p className="text-sm" style={{ color: '#fffef1', opacity: 0.85 }}>El mundo a través de los idiomas</p>
        </div>

        {/* Tres columnas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {/* Navegación */}
          <div className="text-center md:text-left md:border-r" style={{ borderColor: '#fffef1', borderRightWidth: '2px' }}>
            <h4 className="font-serif font-bold text-lg mb-4" style={{ color: '#fffef1' }}>Navegación</h4>
            <ul className="space-y-2 text-sm" style={{ color: '#fffef1', opacity: 0.95 }}>
              <li><a href="/quienes-somos" className="hover:underline" style={{ color: '#fffef1' }}>Quiénes somos</a></li>
              <li><a href="/cursos" className="hover:underline" style={{ color: '#fffef1' }}>Cursos</a></li>
              <li><a href="/testimonios" className="hover:underline" style={{ color: '#fffef1' }}>Testimonios</a></li>
              <li><a href="/blog" className="hover:underline" style={{ color: '#fffef1' }}>Blog</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="text-center md:text-left md:border-r" style={{ borderColor: '#fffef1', borderRightWidth: '2px' }}>
            <h4 className="font-serif font-bold text-lg mb-4" style={{ color: '#fffef1' }}>Contacto</h4>
            <ul className="space-y-2 text-sm" style={{ color: '#fffef1', opacity: 0.95 }}>
              <li><a href="mailto:automatic@atisbeacademy.com" className="hover:underline" style={{ color: '#fffef1' }}>automatic@atisbeacademy.com</a></li>
              <li><a href="tel:+573227850345" className="hover:underline" style={{ color: '#fffef1' }}>+57 322 785 0345</a></li>
              <li><a href="/politicas-privacidad" className="hover:underline" style={{ color: '#fffef1' }}>Políticas de privacidad</a></li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div className="text-center md:text-left">
            <h4 className="font-serif font-bold text-lg mb-4" style={{ color: '#fffef1' }}>Síguenos</h4>
            <div className="flex gap-4 justify-center md:justify-start">
              <a 
                href="https://www.instagram.com/atisbeacademiadeidiomas/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                style={{ color: '#fffef1' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/share/1743xYSEf1/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                style={{ color: '#fffef1' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@atisbeacademiadeidiomas?_r=1&_t=ZN-91IfqrLpoRi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                style={{ color: '#fffef1' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v6.5a4.5 4.5 0 1 0 4.5 4.5V9a6 6 0 0 1-6-6z" />
                  <path d="M17.5 3.5v2.1a6 6 0 0 0 2.5.5v-2a4.5 4.5 0 0 1-2.5-1.1z" opacity="0.9" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/20 py-4 text-center text-sm" style={{ color: '#fffef1', opacity: 0.7 }}>
        © {new Date().getFullYear()} Atisbe Academy. Todos los derechos reservados.
      </div>
    </footer>
  )
}
