import { useEffect, useState } from 'react'
import { getBlogPosts, type BlogPost } from '../services/api'

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const blogCategories = [
    { value: 'all', label: 'Todos los artículos' },
    { value: 'consejos', label: 'Consejos' },
    { value: 'gramatica', label: 'Gramática' },
    { value: 'vocabulario', label: 'Vocabulario' },
    { value: 'cultura', label: 'Cultura' },
    { value: 'recursos', label: 'Recursos' }
  ]

  const toggleExpanded = (id: number) => {
    setExpandedPosts(prev => {
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
  <main className="min-h-screen bg-brand-beige">
      {/* Header Section */}
      <div className="bg-brand-purple text-white py-16">
        <div className="container-padded text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">Blog</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Artículos, consejos y recursos para aprender inglés
          </p>
        </div>
      </div>

      {/* Category Filters */}
      {!loading && posts.length > 0 && (
        <div className="bg-brand-surface border-b border-brand-black/10">
          <div className="container-padded py-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {blogCategories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-5 py-2.5 rounded-full font-semibold transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-brand-purple text-white shadow-lg scale-105'
                      : 'bg-white text-brand-black hover:bg-brand-purple/10 border border-brand-black/10 hover:border-brand-purple'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
            {posts
              .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
              .map((p) => {
                const postId = p.id || 0
                const isExpanded = expandedPosts.has(postId)
                const isLongText = p.content && p.content.length > 500
                
                return (
                <article 
                  key={p.id} 
                  className="group relative bg-white border-b-2 border-gray-100 pb-12 last:border-b-0 hover:bg-gray-50/50 transition-all duration-300 rounded-2xl p-6"
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

                {/* Content */}
                {p.content && (
                  <div className="mb-6">
                    <div 
                      className="text-gray-700 leading-relaxed"
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {isExpanded || !isLongText ? p.content : p.content.substring(0, 500) + '...'}
                    </div>
                    {isLongText && (
                      <button
                        onClick={() => toggleExpanded(postId)}
                        className="mt-4 text-brand-purple font-semibold hover:text-brand-purple/80 transition-colors flex items-center gap-2"
                      >
                        {isExpanded ? (
                          <>
                            Ver menos 
                            <span className="text-xl">↑</span>
                          </>
                        ) : (
                          <>
                            Ver más 
                            <span className="text-xl">↓</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Author */}
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
                </div>
              </article>
                )
              })}
          </div>
        )}
      </div>
    </main>
  )
}
