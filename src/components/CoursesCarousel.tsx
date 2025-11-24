import { useEffect, useState, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import { getCourses, type Course } from '../services/api'

export default function CoursesCarousel() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const swiperRef = useRef<SwiperType | null>(null)

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
        <Swiper 
          slidesPerView={1.1} 
          spaceBetween={16} 
          modules={[Navigation]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3.2 } }}
        >
          {courses.map((c) => (
            <SwiperSlide key={c.id}>
              <article className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-lg transition-shadow">
                {c.image_url && (
                  <div className="w-full h-40 bg-gray-50 flex items-center justify-center p-4">
                    <img src={c.image_url} alt={c.title} className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="p-5 flex flex-col justify-between" style={{ minHeight: c.image_url ? '10rem' : '12rem' }}>
                  <div>
                    <h3 className="font-serif text-xl">{c.title}</h3>
                    <p className="text-sm text-brand-black/70 line-clamp-2">{c.description}</p>
                    {c.level && <p className="text-xs text-brand-purple/70 mt-1">Nivel: {c.level}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-brand-black/60">{c.modality || '24/7'} • Método ATIKA</div>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="flex justify-center gap-4 mt-6">
          <button 
            onClick={() => swiperRef.current?.slidePrev()}
            className="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => swiperRef.current?.slideNext()}
            className="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
