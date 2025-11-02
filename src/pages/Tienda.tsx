import { useEffect, useState } from 'react'
import axios from 'axios'

interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock: number
}

export default function Tienda() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/public/products.php')
        setProducts(res.data.items || res.data || [])
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      curso: 'Curso',
      material: 'Material',
      club: 'Club',
      taller: 'Taller',
      general: 'General'
    }
    return labels[category] || category
  }

  return (
    <main>
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-brand-purple to-purple-800 text-white py-20">
        <div className="container-padded text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Tienda virtual
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Encuentra cursos, materiales y recursos para tu aprendizaje
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-padded py-16">
        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-xl text-gray-500">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-xl text-gray-500 py-12">No hay productos disponibles.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {products.map((product) => (
              <article 
                key={product.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-brand-purple to-purple-600 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-brand-purple/10 text-brand-purple rounded-full">
                      {getCategoryLabel(product.category)}
                    </span>
                    {product.stock > 0 && (
                      <span className="text-xs text-green-600 font-semibold">
                        {product.stock} disponibles
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div className="text-2xl font-bold text-brand-purple">
                      ${product.price.toFixed(2)}
                    </div>
                    <button className="btn-primary">
                      Comprar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
