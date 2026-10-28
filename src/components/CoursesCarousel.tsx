import { useEffect, useState, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import { getCourses, getCourseDisplayTitle, type Course } from '../services/api'
import { Link } from 'react-router-dom'

function getCourseTypeLabel(type?: string) {
  switch (type) {
    case 'cursos-idiomas':
      return 'Idiomas'
    case 'refuerzos':
      return 'Refuerzos'
    case 'conversarte':
      return 'Experiencias'
    default:
      return 'Formación'
  }
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
      />
    </svg>
  )
}

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
      <section className="mx-auto max-w-7xl" aria-label="Cursos disponibles" aria-busy="true">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="overflow-hidden rounded-3xl border border-brand-sand/60 bg-brand-cream shadow-sm">
              <div className="aspect-[16/9] animate-pulse bg-brand-sand/50" />
              <div className="space-y-4 p-6">
                <div className="h-4 w-24 animate-pulse rounded-full bg-brand-sand/50" />
                <div className="h-6 w-2/3 animate-pulse rounded bg-brand-sand/50" />
                <div className="h-4 w-full animate-pulse rounded bg-brand-sand/40" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (courses.length === 0) {
    return (
      <section className="mx-auto max-w-7xl rounded-3xl border border-brand-sand/60 bg-brand-cream px-6 py-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-purple/10 text-brand-purple">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.506 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18s-3.332.506-4.5 1.253" />
          </svg>
        </div>
        <p className="mt-4 font-serif text-xl font-bold text-brand-black">Estamos preparando nuevos cursos</p>
        <p className="mt-2 text-sm text-brand-coffee">Vuelve pronto para descubrir las próximas opciones.</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl" aria-label="Cursos destacados">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-brand-coffee">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand-green align-middle" />
          Modalidad virtual <span className="mx-2 text-brand-sand">·</span> Método ATIKA
        </p>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-sand bg-brand-cream text-brand-purple transition hover:border-brand-purple hover:bg-brand-purple hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
            aria-label="Ver cursos anteriores"
          >
            <ArrowIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-sand bg-brand-cream text-brand-purple transition hover:border-brand-purple hover:bg-brand-purple hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
            aria-label="Ver más cursos"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>
      </div>
      <div className="-mx-1 px-1 pb-5">
        <Swiper 
          slidesPerView={1.08}
          spaceBetween={18}
          modules={[Navigation]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          watchOverflow
        >
          {courses.map((c) => (
            <SwiperSlide key={c.id ?? c.title} className="h-auto">
              <Link
                to={c.id != null ? `/cursos/${c.id}/modalidades` : '/cursos'}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-brand-sand/60 bg-brand-cream shadow-[0_8px_30px_rgba(56,42,29,0.07)] transition duration-300 hover:-translate-y-1 hover:border-brand-mauve hover:shadow-[0_18px_40px_rgba(56,42,29,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
                aria-label={`Ver modalidades de ${getCourseDisplayTitle(c.title)}`}
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-brand-beige">
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-plum via-brand-purple to-brand-mauve">
                      <span className="font-serif text-6xl font-bold text-white/90">
                        {getCourseDisplayTitle(c.title).charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-plum/65 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-brand-plum/65 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
                    {getCourseTypeLabel(c.course_type)}
                  </span>
                  {c.level && (
                    <span className="absolute right-4 top-4 rounded-full bg-brand-cream/95 px-3 py-1 text-xs font-semibold text-brand-purple shadow-sm">
                      {c.level}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="font-serif text-xl font-bold leading-snug text-brand-black transition-colors group-hover:text-brand-purple">
                    {getCourseDisplayTitle(c.title)}
                  </h3>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-brand-coffee">
                    {c.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-brand-sand/60 pt-4 text-xs font-medium text-brand-taupe">
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {c.duration || 'Horario flexible'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
                        <circle cx="12" cy="10" r="2.2" strokeWidth={1.8} />
                      </svg>
                      En línea
                    </span>
                  </div>
                  <div className="mt-5 flex items-center justify-between text-sm font-bold text-brand-purple">
                    <span>Conoce el curso</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple/10 transition group-hover:bg-brand-purple group-hover:text-white">
                      <ArrowIcon direction="right" />
                    </span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
