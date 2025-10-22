import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import Home from './pages/Home'
import QuienesSomos from './pages/QuienesSomos'
import Cursos from './pages/Cursos'
import Testimonios from './pages/Testimonios'
import Blog from './pages/Blog'
import Contacto from './pages/Contacto'
import Pago from './pages/Pago'
import ZonaEstudiantes from './pages/ZonaEstudiantes'
import Tienda from './pages/Tienda'
import Influencers from './pages/Influencers'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/testimonios" element={<Testimonios />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/pago" element={<Pago />} />
          <Route path="/zona-estudiantes" element={<ZonaEstudiantes />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/influencers" element={<Influencers />} />
        </Routes>
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default App
