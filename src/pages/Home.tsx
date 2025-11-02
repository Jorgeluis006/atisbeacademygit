import { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import CoursesCarousel from '../components/CoursesCarousel'
import { Link } from 'react-router-dom'
import { getTestimonials, type Testimonial, getBlogPosts, type BlogPost, getVideos, type Video } from '../services/api'

export default function Home() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [testimonialsData, blogData, videosData] = await Promise.all([
          getTestimonials(),
          getBlogPosts(),
          getVideos()
        ])
        setTestimonials(testimonialsData.slice(0, 3))
        setBlogPosts(blogData.slice(0, 3))
        setVideos(videosData.slice(0, 3))
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <main>
      <Hero />
      
      {/* Quiénes Somos Section */}
      <section className="bg-brand-purple py-20">
        <div className="container-padded">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Quiénes somos
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Una academia cercana que transforma vidas a través del aprendizaje de idiomas
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            {/* Introduction */}
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-8">
              <p className="text-xl md:text-2xl leading-relaxed text-gray-700 text-center">
                Atisbe es una academia <span className="font-bold text-brand-purple">cercana, alegre, disciplinada, motivadora y flexible</span>. 
                Aplicamos el método ATIKA para lograr avances sostenibles paso a paso.
              </p>
            </div>

            {/* Values */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { icon: '🤝', title: 'Cercana', color: 'from-purple-500 to-purple-600' },
                { icon: '😊', title: 'Alegre', color: 'from-pink-500 to-pink-600' },
                { icon: '🎯', title: 'Disciplinada', color: 'from-amber-500 to-amber-600' },
                { icon: '💪', title: 'Motivadora', color: 'from-blue-500 to-blue-600' },
                { icon: '🌟', title: 'Flexible', color: 'from-green-500 to-green-600' }
              ].map((value, index) => (
                <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${value.color} rounded-full flex items-center justify-center text-3xl shadow-md`}>
                    {value.icon}
                  </div>
                  <h3 className="font-bold text-white">{value.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Cursos Section */}
      <section className="bg-brand-beige py-20">
        <div className="container-padded">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Nuestros Cursos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encuentra el curso perfecto para ti
            </p>
          </div>
          <CoursesCarousel />
          <div className="text-center mt-12">
            <Link className="btn-primary inline-flex" to="/cursos">Ver todos los cursos</Link>
          </div>
        </div>
      </section>

      {/* Testimonios preview */}
      <section className="bg-brand-purple py-20">
        <div className="container-padded">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Testimonios reales
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Opiniones auténticas de nuestros estudiantes
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-xl text-gray-500">Cargando testimonios...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <p className="text-center text-xl text-gray-500 py-12">No hay testimonios disponibles aún.</p>
          ) : (
            <>
              <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {testimonials.map((t) => (
              <article key={t.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                {t.image_url ? (
                  <img src={t.image_url} alt={t.author_name} className="w-14 h-14 rounded-full object-cover mb-4 ring-2 ring-brand-purple/20" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-purple to-brand-pink mb-4 flex items-center justify-center text-white font-bold text-lg">
                    {t.author_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <span key={i} className="text-brand-amber text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{t.content.substring(0, 100)}{t.content.length > 100 ? '...' : ''}"</p>
                <div className="pt-3 border-t border-gray-100">
                  <div className="font-bold text-gray-900">{t.author_name}</div>
                  {t.author_role && <div className="text-sm text-gray-500">{t.author_role}</div>}
                </div>
              </article>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link className="bg-white text-brand-purple px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg inline-flex" to="/testimonios">Ver todos los testimonios</Link>
          </div>
          </>
        )}
        </div>
      </section>

      {/* Videos de testimonios */}
      <section className="bg-brand-beige py-20">
        <div className="container-padded">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Videos de testimonios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escucha directamente de nuestros estudiantes
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-xl text-gray-500">Cargando videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <p className="text-center text-xl text-gray-500 py-12">No hay videos disponibles aún.</p>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {videos.map((video) => (
              <div key={video.id} className="aspect-video rounded-2xl overflow-hidden bg-gray-900 shadow-lg hover:shadow-2xl transition-shadow">
                {video.video_url.includes('youtube') || video.video_url.includes('vimeo') ? (
                  <iframe
                    src={video.video_url}
                    title={video.title || 'Video'}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={video.video_url}
                    controls
                    className="w-full h-full object-cover"
                    poster={video.thumbnail_url}
                  >
                    Tu navegador no soporta el elemento de video.
                  </video>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link className="btn-primary inline-flex" to="/testimonios">Ver todos los videos</Link>
          </div>
          </>
        )}
        </div>
      </section>

      {/* Blog teaser */}
      <section className="bg-brand-beige py-20">
        <div className="container-padded">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Blog
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Artículos, consejos y recursos para aprender inglés
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-xl text-gray-500">Cargando artículos...</p>
            </div>
          ) : blogPosts.length === 0 ? (
            <p className="text-center text-xl text-gray-500 py-12">No hay artículos publicados aún.</p>
          ) : (
            <>
              <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {blogPosts.map((post) => (
              <Link 
                key={post.id} 
                to="/blog" 
                className="block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  {post.category && (
                    <span className="inline-block mb-2 px-3 py-1 text-xs font-semibold bg-brand-purple text-white rounded-full">
                      {post.category}
                    </span>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4">{post.excerpt.substring(0, 80)}...</p>
                  )}
                  <p className="text-brand-purple font-semibold">Leer más →</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link className="bg-brand-purple text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-purple/90 transition-all hover:scale-105 shadow-lg inline-flex" to="/blog">Ver todos los artículos</Link>
          </div>
          </>
        )}
        </div>
      </section>

      {/* Pago QR */}
      <section className="bg-brand-beige py-20">
        <div className="container-padded">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Realiza tu pago
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pago seguro y certificado
            </p>
          </div>
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Escanea el código QR</h3>
                <p className="text-gray-700 mb-4">Realiza tu pago de forma rápida y segura escaneando el código QR.</p>
                <div className="flex items-center gap-2 text-green-600">
                  <span className="text-2xl">🔒</span>
                  <span className="font-semibold">Certificación HTTPS activada</span>
                </div>
              </div>
              <div className="aspect-square bg-gradient-to-br from-brand-yellow to-amber-400 rounded-2xl shadow-md flex items-center justify-center">
                <span className="text-white text-6xl">📱</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
