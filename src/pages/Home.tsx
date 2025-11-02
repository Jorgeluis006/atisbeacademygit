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
      <CoursesCarousel />

      {/* Testimonios preview */}
      <section className="container-padded py-16">
        <h2 className="text-3xl font-extrabold">Testimonios reales</h2>
        <p className="mt-2 text-brand-black/70">Opiniones auténticas de nuestros estudiantes.</p>
        {loading ? (
          <p className="mt-6 text-brand-black/70">Cargando testimonios...</p>
        ) : testimonials.length === 0 ? (
          <p className="mt-6 text-brand-black/70">No hay testimonios disponibles aún.</p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <article key={t.id} className="bg-white rounded-2xl p-6 shadow-soft">
                {t.image_url ? (
                  <img src={t.image_url} alt={t.author_name} className="w-12 h-12 rounded-full object-cover mb-3" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-pink/60 mb-3 flex items-center justify-center text-white font-bold">
                    {t.author_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <span key={i} className="text-brand-amber">★</span>
                  ))}
                </div>
                <p className="text-sm text-brand-black/80">"{t.content.substring(0, 100)}{t.content.length > 100 ? '...' : ''}"</p>
                <div className="mt-2">
                  <div className="text-sm font-semibold text-brand-black">{t.author_name}</div>
                  {t.author_role && <div className="text-xs text-brand-black/60">{t.author_role}</div>}
                </div>
              </article>
            ))}
          </div>
        )}
        <Link className="btn-primary mt-8 inline-flex" to="/testimonios">Ver más testimonios</Link>
      </section>

      {/* Videos de testimonios */}
      <section className="container-padded py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold">Videos de testimonios</h2>
          <Link className="text-sm font-semibold text-brand-purple hover:text-brand-amber" to="/testimonios">
            Ver todos →
          </Link>
        </div>
        {loading ? (
          <p className="text-brand-black/70">Cargando videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-brand-black/70">No hay videos disponibles aún.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div key={video.id} className="aspect-video rounded-xl overflow-hidden bg-brand-black/10 shadow-soft">
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
        )}
      </section>

      {/* Blog teaser */}
      <section className="container-padded py-12">
        <h2 className="text-3xl font-extrabold">Blog</h2>
        {loading ? (
          <p className="mt-6 text-brand-black/70">Cargando artículos...</p>
        ) : blogPosts.length === 0 ? (
          <p className="mt-6 text-brand-black/70">No hay artículos publicados aún.</p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {blogPosts.map((post) => (
              <Link 
                key={post.id} 
                to="/blog" 
                className="block bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-shadow"
              >
                {post.image_url && (
                  <img src={post.image_url} alt={post.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                )}
                <h3 className="font-serif text-xl">{post.title}</h3>
                {post.excerpt && (
                  <p className="text-sm text-brand-black/70 mt-2">{post.excerpt.substring(0, 80)}...</p>
                )}
                {post.category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-brand-purple/10 text-brand-purple rounded">
                    {post.category}
                  </span>
                )}
                <p className="text-sm text-brand-purple mt-2">Leer más →</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Pago QR */}
      <section className="container-padded py-12">
        <h2 className="text-3xl font-extrabold">Pago</h2>
        <div className="mt-4 bg-white rounded-2xl p-6 shadow-soft grid md:grid-cols-2 gap-6 items-center">
          <div>
            <p className="text-brand-black/80">Escanea el QR para realizar tu pago de forma segura.</p>
            <p className="text-sm text-brand-black/60">Certificación HTTPS activada.</p>
          </div>
          <div className="aspect-square bg-brand-yellow rounded-xl" />
        </div>
      </section>
    </main>
  )
}
