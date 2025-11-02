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
    <main className="container-padded py-12">
      <h1 className="text-4xl font-extrabold">Blog</h1>
      {loading ? (
        <p className="mt-6">Cargando posts...</p>
      ) : posts.length === 0 ? (
        <p className="mt-6 text-brand-black/70">Aún no hay posts publicados.</p>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-lg transition-shadow">
              {p.image_url && (
                <img src={p.image_url} alt={p.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                {p.category && (
                  <span className="inline-block px-2 py-1 bg-brand-purple/10 text-brand-purple text-xs font-semibold rounded mb-2">
                    {p.category}
                  </span>
                )}
                <h3 className="font-serif text-xl mb-2">{p.title}</h3>
                {p.excerpt && (
                  <p className="text-sm text-brand-black/70 mb-3">{p.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-xs text-brand-black/60">
                  {p.author_name && <span>Por {p.author_name}</span>}
                  {p.published_at && (
                    <span>{new Date(p.published_at).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
