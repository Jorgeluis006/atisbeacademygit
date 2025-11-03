import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const navigate = useNavigate()

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

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'curso', label: 'Cursos' },
    { value: 'material', label: 'Materiales' },
    { value: 'club', label: 'Clubs' },
    { value: 'taller', label: 'Talleres' },
    { value: 'general', label: 'General' }
  ]

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  const handleWhatsAppContact = (product: Product) => {
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price as any)
    const message = `Hola! Me interesa el producto: ${product.name} - $${price.toFixed(2)}`
    const whatsappUrl = `https://wa.me/51923906862?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
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

      {/* Category Filters */}
      <div className="bg-brand-surface border-b border-brand-black/10">
        <div className="container-padded py-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-brand-purple text-white shadow-lg'
                    : 'bg-white text-brand-black hover:bg-brand-purple/10 border border-brand-black/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-padded py-16">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-purple border-r-transparent mb-4"></div>
              <p className="text-xl text-gray-500">Cargando productos...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-xl text-gray-500 mb-2">No hay productos disponibles en esta categoría</p>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="text-brand-purple hover:underline"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <p className="text-gray-600">
                Mostrando <span className="font-bold text-brand-purple">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {filteredProducts.map((product) => (
                <article 
                  key={product.id} 
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-brand-purple/10 to-purple-100">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-brand-purple to-purple-600 flex items-center justify-center">
                        <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                    )}
                    {/* Stock Badge */}
                    {product.stock > 0 && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        {product.stock} disponibles
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Agotado
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 text-xs font-bold bg-brand-purple/10 text-brand-purple rounded-full">
                        {getCategoryLabel(product.category)}
                      </span>
                    </div>
                    
                    {/* Product Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Description */}
                    {product.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                        {product.description}
                      </p>
                    )}
                    
                    {/* Price and Action */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Precio</p>
                          <p className="text-3xl font-bold text-brand-purple">
                            ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price as any).toFixed(2)}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleWhatsAppContact(product)}
                          disabled={product.stock === 0}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                            product.stock === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg hover:scale-105'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          {product.stock === 0 ? 'Agotado' : 'WhatsApp'}
                        </button>
                      </div>
                      <button
                        onClick={() => navigate('/pago')}
                        className="w-full bg-brand-purple text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Ir a Pago
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
