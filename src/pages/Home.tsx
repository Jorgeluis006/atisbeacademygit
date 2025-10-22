import Hero from '../components/Hero'
import CoursesCarousel from '../components/CoursesCarousel'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main>
      <Hero />
      <CoursesCarousel />

      {/* Testimonios preview */}
      <section className="container-padded py-16">
        <h2 className="text-3xl font-extrabold">Testimonios reales</h2>
        <p className="mt-2 text-brand-black/70">Opiniones auténticas de nuestros estudiantes.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[1,2,3].map((i) => (
            <article key={i} className="bg-white rounded-2xl p-6 shadow-soft">
              <div className="w-12 h-12 rounded-full bg-brand-pink/60 mb-3" />
              <p className="text-sm text-brand-black/80">“Clases increíbles, mejoré mi nivel en pocas semanas.”</p>
              <div className="mt-2 text-xs text-brand-black/60">Ana Valeria Oviedo</div>
            </article>
          ))}
        </div>
        <Link className="btn-primary mt-8 inline-flex" to="/testimonios">Ver más testimonios</Link>
      </section>

      {/* Blog teaser */}
      <section className="container-padded py-12">
        <h2 className="text-3xl font-extrabold">Blog</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            { t: 'Cómo prepararte para el IELTS', href: '/blog' },
            { t: '5 tips para que tus hijos amen los idiomas', href: '/blog' },
            { t: 'Ejercicios de gramática prácticos', href: '/blog' },
          ].map((p) => (
            <a key={p.t} href={p.href} className="block bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-shadow">
              <h3 className="font-serif text-xl">{p.t}</h3>
              <p className="text-sm text-brand-black/70 mt-2">Leer más</p>
            </a>
          ))}
        </div>
      </section>

      {/* Pago QR */}
      <section className="container-padded py-12">
        <h2 className="text-3xl font-extrabold">Pago</h2>
        <div className="mt-4 bg-white rounded-2xl p-6 shadow-soft grid md:grid-cols-2 gap-6 items-center">
          <div>
            <p className="text-brand-black/80">Escanea el QR para realizar tu pago de forma segura.</p>
            <p className="text-sm text-brand-black/60">Certificación HTTPS activada.</p>
          </div>
          <div className="aspect-square bg-brand-yellow rounded-xl" />
        </div>
      </section>
    </main>
  )
}
