import { useEffect, useState } from 'react'
import { getTestimonials, type Testimonial, getVideos, type Video } from '../services/api'

export default function Testimonios() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

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
    <main className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-20">
        <div className="container-padded text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            Lo que dicen nuestros estudiantes
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Historias reales de personas que han transformado su inglés con nosotros
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
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mb-12 bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-purple mb-2">{items.length}+</div>
                <div className="text-gray-600">Testimonios</div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-4xl font-bold text-brand-purple mb-2">5.0</div>
                <div className="text-gray-600 flex items-center justify-center gap-1">
                  <span className="text-brand-amber">★★★★★</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-purple mb-2">98%</div>
                <div className="text-gray-600">Satisfacción</div>
              </div>
            </div>

            {/* Testimonials Grid - Equal Size */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((t) => (
                <article 
                  key={t.id} 
                  className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <span key={i} className="text-brand-amber text-xl">★</span>
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-gray-700 text-base leading-relaxed mb-6">
                    "{t.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    {t.image_url ? (
                      <img 
                        src={t.image_url} 
                        alt={t.author_name} 
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center text-white font-bold">
                        {t.author_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900">{t.author_name}</div>
                      {t.author_role && (
                        <div className="text-sm text-gray-500">{t.author_role}</div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container-padded">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Testimonios en video
              </h2>
              <p className="text-xl text-gray-600">
                Escucha directamente de nuestros estudiantes
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
                      {video.video_url.includes('youtube') || video.video_url.includes('vimeo') ? (
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para ser nuestro próximo testimonio de éxito?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a cientos de estudiantes que han alcanzado sus metas en inglés
          </p>
          <button className="bg-white text-brand-purple px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg">
            Comienza ahora
          </button>
        </div>
      </div>
    </main>
  )
}
