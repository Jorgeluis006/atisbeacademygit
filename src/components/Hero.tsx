import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="container-padded py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold leading-tight"
        >
          El mundo a través de los idiomas.
        </motion.h1>
        <p className="mt-4 text-lg text-brand-black/80 max-w-prose">
          Aprende con el método ATIKA: progresivo, activo y personalizado. Sin presión, con acompañamiento real.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/contacto" className="btn-primary">¿QUIERES SABER TU NIVEL TOTALMENTE GRATIS?</Link>
          <Link to="/cursos" className="inline-flex items-center font-medium text-brand-purple hover:text-brand-amber">Ver cursos</Link>
        </div>
        <p className="mt-3 text-sm text-brand-black/60">Atendemos 24/7 • Cupos limitados por curso</p>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative"
      >
        {/* Imagen de mascota */}
        <div className="aspect-square">
          <img 
            src="/images/Mascota[1].png" 
            alt="Mascota Atisbe" 
            className="w-full h-full object-contain scale-x-[-1]"
          />
        </div>
      </motion.div>
    </section>
  )
}
