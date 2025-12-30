import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getCourses, getCourseModalities, type Course, type CourseModality } from '../services/api'

export default function Modalidades() {
  const { id } = useParams()
  const courseId = Number(id)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [items, setItems] = useState<CourseModality[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <main className="bg-brand-beige">
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-16">
        <div className="container-padded text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Modalidades</h1>
          {course && (
            <p className="text-white/90">Curso: <span className="font-bold">{course.title}</span></p>
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
                    <button
                      onClick={() => goContact(m)}
                      className="w-full bg-brand-purple text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Elegir esta modalidad
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
