import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBlogPosts, type BlogPost } from '../services/api'

export default function BlogDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [related, setRelated] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const posts = await getBlogPosts()
        const found = posts.find(p => String(p.id) === id) || null
        setPost(found)
        setRelated(posts.filter(p => p.id !== found?.id).slice(0, 3))
      } catch (err) {
        console.error('Error loading blog post:', err)
      } finally {
        setLoading(false)
      }
    })()
    window.scrollTo({ top: 0 })
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-brand-beige">
        <p className="text-xl text-gray-500">Cargando artículo...</p>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-brand-beige py-24 text-center">
        <p className="text-xl text-gray-500 mb-4">No encontramos este artículo.</p>
        <Link to="/blog" className="text-brand-purple font-semibold hover:underline">Volver al blog</Link>
      </main>
    )
  }

  // Dividimos el contenido en dos mitades para insertar la imagen en el medio del artículo
  const paragraphs = (post.content || '').split(/\n\s*\n/).filter(Boolean)
  const midPoint = Math.ceil(paragraphs.length / 2)
  const firstHalf = paragraphs.slice(0, midPoint)
  const secondHalf = paragraphs.slice(midPoint)

  return (
    <main className="min-h-screen bg-brand-beige">
      <div className="bg-brand-purple text-white py-16">
        <div className="container-padded max-w-3xl mx-auto">
          <button
            onClick={() => navigate('/blog')}
            className="text-white/80 hover:text-white text-sm font-semibold mb-6 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al blog
          </button>
          <div className="flex items-center gap-4 mb-4 text-sm">
            {post.category && (
              <span className="px-3 py-1 bg-white/20 rounded-full font-semibold">{post.category}</span>
            )}
            {post.published_at && (
              <span className="text-white/80">
                {new Date(post.published_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold">{post.title}</h1>
          {post.author_name && <p className="mt-4 text-white/80">Por {post.author_name}</p>}
        </div>
      </div>

      <div className="container-padded py-12">
        <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
          {post.excerpt && (
            <p className="text-xl text-gray-700 italic mb-8 leading-relaxed">{post.excerpt}</p>
          )}

          <div className="text-gray-700 leading-relaxed space-y-4">
            {firstHalf.map((p, i) => (
              <p key={`first-${i}`} style={{ whiteSpace: 'pre-wrap' }}>{p}</p>
            ))}
          </div>

          {post.image_url && (
            <div className="my-10 rounded-xl overflow-hidden shadow-md">
              <img src={post.image_url} alt={post.title} className="w-full h-auto max-h-[420px] object-cover" />
            </div>
          )}

          <div className="text-gray-700 leading-relaxed space-y-4">
            {secondHalf.map((p, i) => (
              <p key={`second-${i}`} style={{ whiteSpace: 'pre-wrap' }}>{p}</p>
            ))}
          </div>

          {/* Bloque de llamado a la acción */}
          <div className="mt-12 bg-gradient-to-br from-brand-purple to-purple-600 text-white rounded-2xl p-8 text-center shadow-lg">
            <h3 className="text-2xl font-bold mb-3">¿Quieres seguir mejorando tu inglés?</h3>
            <p className="text-white/90 mb-6 max-w-xl mx-auto">
              Agenda una clase de diagnóstico y descubre el curso ideal para ti.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/cursos" className="bg-white text-brand-purple px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-all">
                Ver cursos
              </Link>
              <Link to="/contacto" className="border-2 border-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-all">
                Contáctanos
              </Link>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">También te puede interesar</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/blog/${r.id}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100"
                >
                  {r.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img src={r.image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-brand-purple transition-colors">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
