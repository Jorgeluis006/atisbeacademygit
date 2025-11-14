import { useEffect, useState } from 'react'
// removed unused useNavigate import
import axios from 'axios'
import PaymentDrawer from '../components/PaymentDrawer'

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

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <main className="bg-brand-beige">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-brand-purple to-purple-800 text-white py-20">
        <div className="container-padded text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
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
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Precio</p>
                        <p className="text-3xl font-bold text-brand-purple">
                          ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price as any).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => { setSelectedProduct(product); setDrawerOpen(true) }}
                        disabled={product.stock === 0}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                          product.stock === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-brand-purple text-white hover:bg-purple-700 hover:shadow-lg hover:scale-105'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {product.stock === 0 ? 'Agotado' : 'Ir a Pago'}
                      </button>

                        
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {/* Payment Drawer outside loop */}
            {drawerOpen && selectedProduct && (
              <PaymentDrawer
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setSelectedProduct(null) }}
                productName={selectedProduct.name}
                price={selectedProduct.price}
              />
            )}
          </>
        )}
      </div>
    </main>
  )
}
