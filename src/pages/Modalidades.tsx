import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourses, getCourseModalities, type Course, type CourseModality } from '../services/api'
import ContactForm from '../components/ContactForm'

export default function Modalidades() {
  const { id } = useParams()
  const courseId = Number(id)
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [items, setItems] = useState<CourseModality[]>([])
  const [loading, setLoading] = useState(true)
  const WHATSAPP_NUMBER = '573227850345'

  useEffect(() => {
    (async () => {
      if (!courseId || Number.isNaN(courseId)) return
      setLoading(true)
      try {
        const courses = await getCourses()
        const found = courses.find(c => c.id === courseId) || null
        setCourse(found)
        const mods = await getCourseModalities(courseId)
        setItems(mods)
      } catch (err) {
        console.error('Error loading modalities:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [courseId])

  function goContact(mod: CourseModality) {
    const curso = course?.title || ''
    const modalidad = mod.title
    navigate(`/contacto?curso=${encodeURIComponent(curso)}&modalidad=${encodeURIComponent(modalidad)}`)
  }

  function goWhatsApp(mod: CourseModality) {
    const curso = course?.title || ''
    const modalidad = mod.title
    const mensaje = `Hola, me interesa el curso ${curso} en la modalidad ${modalidad}`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  return (
    <main className="bg-brand-beige">
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-16">
        <div className="container-padded text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 uppercase">
            {course ? course.title : 'Curso'}
          </h1>
          {course?.description && (
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              {course.description}
            </p>
          )}
        </div>
      </div>

      <div className="container-padded py-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-purple border-r-transparent mb-4"></div>
            <p className="text-gray-500">Cargando modalidades…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">Aún no hay modalidades para este curso.</p>
          </div>
        ) : (
          <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(m => (
              <article key={m.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                {m.image_url && (
                  <div className="w-full aspect-[16/9] bg-gray-50 overflow-hidden">
                    <img src={m.image_url} alt={m.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors">{m.title}</h3>
                  {m.description && <p className="text-gray-600 mb-4 leading-relaxed">{m.description}</p>}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => goWhatsApp(m)}
                        className="w-full bg-brand-purple text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                      >
                        Contactar por WhatsApp
                      </button>
                      <button
                        onClick={() => goContact(m)}
                        className="w-full bg-white text-brand-purple border border-brand-purple py-2.5 px-4 rounded-lg font-semibold hover:bg-brand-purple/10 transition-colors"
                      >
                        Ir a Contacto
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {/* Contact form below modalities */}
          <ContactForm title="¿Te interesa este curso? Contáctanos" prefill={{ curso: course?.title || '' }} />
          </>
        )}
      </div>
    </main>
  )
}
