import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTestimonials, type Testimonial, getVideos, type Video } from '../services/api'

export default function Testimonios() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Testimonial[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const hasDemoTestimonials = items.some((item) => item.author_name.startsWith('[MUESTRA]'))
  const hasDemoVideos = videos.some((video) => video.video_url.startsWith('/images/muestras/'))

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  useEffect(() => {
    (async () => {
      try {
        const [testimonialsData, videosData] = await Promise.all([
          getTestimonials(),
          getVideos()
        ])
        setItems(testimonialsData)
        setVideos(videosData)
      } catch (err) {
        console.error('Error loading testimonials:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
  <main className="min-h-screen bg-brand-beige">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-20">
        <div className="container-padded text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            {hasDemoTestimonials ? 'Experiencias de muestra' : 'Lo que dicen nuestros estudiantes'}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {hasDemoTestimonials
              ? 'Los perfiles y comentarios identificados como MUESTRA son ficticios y solo sirven para previsualizar el diseño.'
              : 'Historias reales de personas que han transformado su inglés con nosotros'}
          </p>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container-padded py-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-xl text-gray-500">Cargando testimonios...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">Aún no hay testimonios publicados.</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {hasDemoTestimonials ? (
              <p className="mb-12 rounded-xl border border-brand-mauve/40 bg-white p-4 text-center text-sm text-brand-purple">
                Atención: esta galería contiene contenido ficticio de demostración, no reseñas reales.
              </p>
            ) : (
              <div className="mb-12 rounded-2xl bg-white p-8 text-center shadow-lg">
                <div className="text-4xl font-bold text-brand-purple">{items.length}</div>
                <div className="mt-2 text-gray-600">Testimonios publicados</div>
              </div>
            )}

            {/* Testimonials Grid - Equal Size */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((t) => {
                const testimonialId = t.id || 0
                const isExpanded = expandedItems.has(testimonialId)
                const isLongText = t.content.length > 200
                
                return (
                  <article 
                    key={t.id} 
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-brand-purple flex flex-col"
                  >
                    {/* Author at top */}
                    <div className="flex items-center gap-3 mb-4">
                      {t.image_url ? (
                        <img 
                          src={t.image_url} 
                          alt={t.author_name} 
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-brand-purple/20" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {t.author_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg">{t.author_name}</div>
                        {t.author_role && (
                          <div className="text-sm text-gray-500">{t.author_role}</div>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                        <span key={i} className="text-brand-amber text-lg">★</span>
                      ))}
                    </div>

                    {/* Content - Expandable */}
                    <div className="flex-1 mb-3">
                      <p className={`text-gray-700 leading-relaxed italic ${!isExpanded && isLongText ? 'line-clamp-6' : ''}`}>
                        "{t.content}"
                      </p>
                    </div>

                    {/* Ver más button */}
                    {isLongText && (
                      <button
                        onClick={() => toggleExpanded(testimonialId)}
                        className="text-brand-purple font-semibold hover:text-brand-purple/80 transition-colors text-sm self-start"
                      >
                        {isExpanded ? 'Ver menos ↑' : 'Ver más ↓'}
                      </button>
                    )}
                  </article>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div className="bg-gradient-to-b from-brand-beige/50 to-brand-beige py-16">
        <div className="container-padded">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Testimonios en video
              </h2>
              <p className="text-xl text-gray-600">
                {hasDemoVideos
                  ? 'Las tarjetas MUESTRA son vistas previas ilustrativas, no videos reales.'
                  : 'Escucha directamente de nuestros estudiantes'}
              </p>
            </div>

            {videos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">Próximamente videos de testimonios...</p>
              </div>
            ) : (
              <div className="grid gap-10 md:grid-cols-2">
                {videos.map((video) => (
                  <div 
                    key={video.id} 
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Video Title */}
                    {video.title && (
                      <div className="p-6 pb-4">
                        <h3 className="text-2xl font-bold text-gray-900">{video.title}</h3>
                      </div>
                    )}
                    
                    {/* Video Player - Large */}
                    <div className="aspect-video bg-gray-900">
                      {video.video_url.startsWith('/images/muestras/') ? (
                        <div className="relative h-full w-full">
                          <img src={video.thumbnail_url || video.video_url} alt="Vista previa de contenido de muestra; no es un video real" className="h-full w-full object-cover" />
                          <span className="absolute bottom-4 left-4 rounded-full bg-brand-plum/90 px-4 py-2 text-sm font-bold text-white">VISTA PREVIA · MUESTRA</span>
                        </div>
                      ) : video.video_url.includes('youtube') || video.video_url.includes('vimeo') ? (
                        <iframe
                          src={video.video_url}
                          title={video.title || 'Video testimonio'}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={video.video_url}
                          controls
                          controlsList="nodownload"
                          className="w-full h-full object-contain bg-black"
                          poster={video.thumbnail_url}
                        >
                          Tu navegador no soporta el elemento de video.
                        </video>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-brand-purple text-white py-16">
        <div className="container-padded text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {hasDemoTestimonials ? '¿Quieres compartir tu experiencia?' : '¿Listo para ser nuestro próximo testimonio de éxito?'}
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            {hasDemoTestimonials
              ? 'Contáctanos para conocer más sobre nuestros programas.'
              : 'Únete a cientos de estudiantes que han alcanzado sus metas en inglés'}
          </p>
          <button 
            onClick={() => navigate('/contacto')}
            className="bg-white text-brand-purple px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg cursor-pointer"
          >
            Comienza ahora
          </button>
        </div>
      </div>
    </main>
  )
}
