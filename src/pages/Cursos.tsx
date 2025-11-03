import { useEffect, useState } from 'react'
import { getCourses, type Course } from '../services/api'

export default function Cursos() {
  const [cursos, setCursos] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    (async () => {
      try {
        const data = await getCourses()
        setCursos(data)
      } catch (err) {
        console.error('Error loading courses:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const courseTypes = [
    { value: 'all', label: 'Todos los cursos' },
    { value: 'ingles', label: 'Inglés' },
    { value: 'frances', label: 'Francés' },
    { value: 'espanol', label: 'Español para extranjeros' },
    { value: 'club-conversacional', label: 'Club Conversacional' },
    { value: 'conversarte', label: 'ConversArte' },
    { value: 'tour-cafetero', label: 'Tour Cafetero' },
    { value: 'ninos', label: 'Cursos para niños' },
    { value: 'personalizadas', label: 'Clases personalizadas' },
    { value: 'general', label: 'General' }
  ]

  const getCourseTypeLabel = (type: string) => {
    const found = courseTypes.find(t => t.value === type)
    return found ? found.label : type
  }

  const filteredCourses = selectedType === 'all' 
    ? cursos 
    : cursos.filter(c => {
        const courseType = c.course_type || 'general'
        return courseType === selectedType
      })

  return (
    <main className="bg-gradient-to-b from-white via-purple-50/20 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-20">
        <div className="container-padded text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            Nuestros cursos
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            Atendemos 24/7 • Cupos limitados por curso
          </p>
        </div>
      </div>

      {/* Course Type Filters */}
      <div className="bg-brand-surface border-b border-brand-black/10">
        <div className="container-padded py-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {courseTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-5 py-2.5 rounded-full font-semibold transition-all ${
                  selectedType === type.value
                    ? 'bg-brand-purple text-white shadow-lg scale-105'
                    : 'bg-white text-brand-black hover:bg-brand-purple/10 border border-brand-black/10 hover:border-brand-purple'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-padded py-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-purple border-r-transparent mb-4"></div>
              <p className="text-xl text-gray-500">Cargando cursos...</p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-xl text-gray-500 mb-2">No hay cursos disponibles en esta categoría</p>
            <button 
              onClick={() => setSelectedType('all')}
              className="text-brand-purple hover:underline font-semibold"
            >
              Ver todos los cursos
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg">
                Mostrando <span className="font-bold text-brand-purple">{filteredCourses.length}</span> {filteredCourses.length === 1 ? 'curso' : 'cursos'}
              </p>
            </div>
            <div className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((c) => (
                <article key={c.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  {c.image_url && (
                    <div className="w-full h-48 bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
                      <img src={c.image_url} alt={c.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap items-start gap-2 mb-3">
                      <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple text-xs font-bold rounded-full">
                        {getCourseTypeLabel(c.course_type || 'general')}
                      </span>
                      {c.level && (
                        <span className="px-3 py-1 bg-brand-purple text-white text-xs font-semibold rounded-full">
                          {c.level}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors">{c.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{c.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                      {c.duration && (
                        <div className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{c.duration}</span>
                        </div>
                      )}
                      {c.modality && (
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          <span>{c.modality}</span>
                        </div>
                      )}
                    </div>
                    {c.price && (
                      <div className="pt-4 border-t border-gray-100">
                        <span className="text-2xl font-bold text-brand-purple">${c.price}</span>
                        <span className="text-gray-500 text-sm ml-1">/ curso</span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
