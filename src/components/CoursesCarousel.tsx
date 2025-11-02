import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { getCourses, type Course } from '../services/api'

export default function CoursesCarousel() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await getCourses()
        setCourses(data)
      } catch (err) {
        console.error('Error loading courses:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <section className="container-padded py-12">
        <h2 className="text-3xl font-extrabold">Nuestros cursos</h2>
        <p className="mt-6 text-brand-black/70">Cargando cursos...</p>
      </section>
    )
  }

  if (courses.length === 0) {
    return (
      <section className="container-padded py-12">
        <h2 className="text-3xl font-extrabold">Nuestros cursos</h2>
        <p className="mt-6 text-brand-black/70">No hay cursos disponibles en este momento.</p>
      </section>
    )
  }

  return (
    <section className="container-padded py-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold">Nuestros cursos</h2>
        <span className="text-sm font-semibold text-brand-black/70">Cupos limitados por curso</span>
      </div>
      <div className="mt-6">
        <Swiper slidesPerView={1.1} spaceBetween={16} breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3.2 } }}>
          {courses.map((c) => (
            <SwiperSlide key={c.id}>
              <article className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-lg transition-shadow">
                {c.image_url && (
                  <img src={c.image_url} alt={c.title} className="w-full h-32 object-cover" />
                )}
                <div className="p-5 flex flex-col justify-between" style={{ minHeight: c.image_url ? '10rem' : '12rem' }}>
                  <div>
                    <h3 className="font-serif text-xl">{c.title}</h3>
                    <p className="text-sm text-brand-black/70 line-clamp-2">{c.description}</p>
                    {c.level && <p className="text-xs text-brand-purple/70 mt-1">Nivel: {c.level}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-brand-black/60">{c.modality || '24/7'} • Método ATIKA</div>
                    {c.price && <div className="text-sm font-semibold text-brand-purple">${c.price}</div>}
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
