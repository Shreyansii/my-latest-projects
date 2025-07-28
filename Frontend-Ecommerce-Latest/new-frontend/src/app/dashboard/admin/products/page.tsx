'use client'
import { useEffect, useState } from 'react'
import api from '../../../../api/axios' 
import { Loader2, Plus, Edit, Trash2, Package, Eye, EyeOff, X, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  description: string
  price: string | number
  status: 'active' | 'inactive'
  category: number
  category_name: string
  stock_quantity: number
  reserved_stock: number
  current_stock: number
  available_stock: number
  image: string | null
  created_at: string
  updated_at: string
}

interface ApiResponse {
  results?: Product[]
  count?: number
  next?: string | null
  previous?: string | null
}

type ProductsResponse = Product[] | ApiResponse

interface ProductFormData {
  name: string
  description: string
  price: string
  status: 'active' | 'inactive'
  category: string
  stock_quantity: string
  image?: File | null
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    status: 'active',
    category: '',
    stock_quantity: '',
    image: null
  })

  // Filtered products based on search and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter
    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await api.get<ProductsResponse>('admin/products/')
      
      let productsData: Product[]
      if (res.data && typeof res.data === 'object' && 'results' in res.data) {
        productsData = res.data.results || []
      } else if (Array.isArray(res.data)) {
        productsData = res.data
      } else {
        throw new Error('Unexpected response format')
      }
      
      setProducts(productsData)
    } catch (err: any) {
      console.error('Fetch products error:', err)
      if (err.response?.status === 403) {
        setError('Access denied. Admin authentication required.')
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please login as admin.')
      } else {
        setError(`Failed to load products: ${err.response?.status || 'Network Error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get<Category[]>('admin/categories/')
      setCategories(res.data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      status: 'active',
      category: '',
      stock_quantity: '',
      image: null
    })
  }

  const handleAddProduct = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      status: product.status,
      category: product.category.toString(),
      stock_quantity: product.stock_quantity.toString(),
      image: null
    })
    setShowEditModal(true)
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.category || !formData.price) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const submitData = new FormData()
      submitData.append('name', formData.name.trim())
      submitData.append('description', formData.description.trim())
      submitData.append('price', formData.price)
      submitData.append('status', formData.status)
      submitData.append('category', formData.category)
      submitData.append('stock_quantity', formData.stock_quantity || '0')
      
      if (formData.image) {
        submitData.append('image', formData.image)
      }

      let response
      if (editingProduct) {
        // Update existing product
        response = await api.patch(`admin/products/${editingProduct.id}/`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        // Update local state
        setProducts(products.map(p => 
          p.id === editingProduct.id ? response.data : p
        ))
        setShowEditModal(false)
      } else {
        // Create new product
        response = await api.post('admin/products/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        // Add to local state
        setProducts([response.data, ...products])
        setShowAddModal(false)
      }

      resetForm()
      setEditingProduct(null)
    } catch (err: any) {
      console.error('Failed to save product:', err)
      alert(`Failed to save product: ${err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleProductStatus = async (productId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      
      await api.patch(`admin/products/${productId}/`, {
        status: newStatus
      })

      // Update local state
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, status: newStatus as 'active' | 'inactive' }
          : product
      ))
    } catch (err: any) {
      console.error('Failed to update product status:', err)
      alert(`Failed to update product status: ${err.response?.data?.detail || 'Unknown error'}`)
    }
  }

  const deleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`admin/products/${productId}/`)
      setProducts(products.filter(product => product.id !== productId))
    } catch (err: any) {
      console.error('Failed to delete product:', err)
      alert(`Failed to delete product: ${err.response?.data?.detail || 'Unknown error'}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, image: file }))
  }

  // Modal Component
  const ProductModal = ({ isOpen, onClose, title, isEdit = false }: { 
    isOpen: boolean
    onClose: () => void
    title: string
    isEdit?: boolean 
  }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmitProduct} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.image && (
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {formData.image.name}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEdit ? 'Update' : 'Create'} Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500 text-center mt-10">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 block mx-auto"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <button 
          onClick={handleAddProduct}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4 md:space-y-0 md:flex md:gap-4 md:items-center">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              statusFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium ${
              statusFilter === 'active' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active ({products.filter(p => p.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-medium ${
              statusFilter === 'inactive' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Inactive ({products.filter(p => p.status === 'inactive').length})
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm || statusFilter !== 'all' 
              ? 'No products match your filters' 
              : 'No products found'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <div className="flex gap-1 ml-2">
                    {/* Status Toggle Button */}
                    <button
                      onClick={() => toggleProductStatus(product.id, product.status)}
                      className={`p-2 rounded-lg transition-colors ${
                        product.status === 'active'
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={`${product.status === 'active' ? 'Deactivate' : 'Activate'} product`}
                    >
                      {product.status === 'active' ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* Edit Button */}
                    <button 
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Product Image */}
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg bg-gray-100"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                {/* Product Info */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      ${product.price}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium">{product.category_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Stock:</span>
                      <p className="font-medium">
                        {product.available_stock}
                        {product.reserved_stock > 0 && (
                          <span className="text-orange-600 text-xs ml-1">
                            ({product.reserved_stock} reserved)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 pt-2 border-t">
                    Created: {new Date(product.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
      />
      
      <ProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Product"
        isEdit={true}
      />
    </div>
  )
}