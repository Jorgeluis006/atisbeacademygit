import { useEffect, useState } from 'react'
import { getBlogPosts, type BlogPost } from '../services/api'

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await getBlogPosts()
        setPosts(data)
      } catch (err) {
        console.error('Error loading blog posts:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-beige to-brand-beige/80">
      {/* Header Section */}
      <div className="bg-brand-purple text-white py-16">
        <div className="container-padded text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">Blog</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Artículos, consejos y recursos para aprender inglés
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-padded py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-xl text-gray-500">Cargando posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">Aún no hay posts publicados.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-12">
            {posts.map((p) => (
              <article 
                key={p.id} 
                className="group relative bg-brand-beige border-b-2 border-gray-100 pb-12 last:border-b-0 hover:bg-gray-50/50 transition-all duration-300 rounded-2xl p-6"
              >
                {/* Category & Date */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  {p.category && (
                    <span className="inline-block px-3 py-1 bg-brand-purple text-white font-semibold rounded-full">
                      {p.category}
                    </span>
                  )}
                  {p.published_at && (
                    <span className="text-gray-500">
                      {new Date(p.published_at).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-brand-purple transition-colors">
                  {p.title}
                </h2>

                {/* Image */}
                {p.image_url && (
                  <div className="mb-6 rounded-xl overflow-hidden shadow-md">
                    <img 
                      src={p.image_url} 
                      alt={p.title} 
                      className="w-full h-auto max-h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Excerpt */}
                {p.excerpt && (
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    {p.excerpt}
                  </p>
                )}

                {/* Content Preview */}
                {p.content && (
                  <div 
                    className="prose prose-lg max-w-none text-gray-600 mb-6 line-clamp-3"
                    dangerouslySetInnerHTML={{ 
                      __html: p.content.substring(0, 200) + (p.content.length > 200 ? '...' : '') 
                    }}
                  />
                )}

                {/* Author & Read More */}
                <div className="flex items-center justify-between">
                  {p.author_name && (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-brand-purple/10 rounded-full flex items-center justify-center">
                        <span className="text-brand-purple font-bold">
                          {p.author_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-700 font-medium">Por {p.author_name}</span>
                    </div>
                  )}
                  <button className="text-brand-purple font-semibold hover:underline flex items-center gap-2 group-hover:gap-3 transition-all">
                    Leer más 
                    <span className="text-xl">→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
