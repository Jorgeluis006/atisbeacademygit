import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import QuienesSomos from './pages/QuienesSomos'
import Cursos from './pages/Cursos'
import Testimonios from './pages/Testimonios'
import Blog from './pages/Blog'
import Contacto from './pages/Contacto'
import Pago from './pages/Pago'
import PoliticasPrivacidad from './pages/PoliticasPrivacidad'
import ZonaEstudiantes from './pages/ZonaEstudiantes'
import Tienda from './pages/Tienda'
import Influencers from './pages/Influencers'
import Admin from './pages/Admin'
import Profesor from './pages/Profesor'
import ResetPassword from './pages/ResetPassword'
import Modalidades from './pages/Modalidades'
import Examenes from './pages/Examenes'
import ExamenDetalle from './pages/ExamenDetalle'
import Corporativo from './pages/Corporativo'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/cursos/:id/modalidades" element={<Modalidades />} />
          <Route path="/corporativo" element={<Corporativo />} />
          <Route path="/examenes" element={<Examenes />} />
          <Route path="/examenes/:id" element={<ExamenDetalle />} />
          <Route path="/testimonios" element={<Testimonios />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/pago" element={<Pago />} />
          <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />
          <Route path="/zona-estudiantes" element={<ZonaEstudiantes />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/influencers" element={<Influencers />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profesor" element={<Profesor />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default App
