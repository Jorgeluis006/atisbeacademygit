import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

const courses = [
  { title: 'Inglés', desc: 'Todos los niveles', img: '' },
  { title: 'Francés', desc: 'Nivel A1–C1', img: '' },
  { title: 'Español para extranjeros', desc: 'Cultura + lenguaje', img: '' },
  { title: 'Club Conversacional', desc: 'Práctica guiada', img: '' },
  { title: 'ConversArte', desc: 'Arte + idioma', img: '' },
  { title: 'Tour Cafetero', desc: 'Experiencia inmersiva', img: '' },
  { title: 'Cursos para niños', desc: 'Lúdico y efectivo', img: '' },
  { title: 'Clases personalizadas', desc: '100% a tu medida', img: '' },
]

export default function CoursesCarousel() {
  return (
    <section className="container-padded py-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold">Nuestros cursos</h2>
        <span className="text-sm font-semibold text-brand-black/70">Cupos limitados por curso</span>
      </div>
      <div className="mt-6">
        <Swiper slidesPerView={1.1} spaceBetween={16} breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3.2 } }}>
          {courses.map((c) => (
            <SwiperSlide key={c.title}>
              <article className="bg-white rounded-2xl p-5 shadow-soft h-48 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl">{c.title}</h3>
                  <p className="text-sm text-brand-black/70">{c.desc}</p>
                </div>
                <div className="text-xs text-brand-black/60">24/7 • Método ATIKA</div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
