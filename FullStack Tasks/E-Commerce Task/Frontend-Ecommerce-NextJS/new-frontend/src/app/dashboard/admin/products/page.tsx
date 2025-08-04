
'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import api from '../../../../api/axios'
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Package,
  Eye,
  EyeOff,
  X,
  Save,
  AlertCircle
} from 'lucide-react'
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

// Move ProductModal outside of the main component to prevent recreation
const ProductModal = ({ 
  isOpen, 
  onClose, 
  title, 
  isEdit = false, 
  formData, 
  onInputChange, 
  onImageChange, 
  onSubmit, 
  categories, 
  validationError, 
  submitting 
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  isEdit?: boolean
  formData: ProductFormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  categories: Category[]
  validationError: string
  submitting: boolean
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        nameInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              ref={nameInputRef}
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                validationError && (validationError.includes('name') || validationError.includes('product'))
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                step="0.01"
                min="0"
                max="999999.99"
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                  validationError && validationError.includes('price')
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-purple-500'
                }`}
                required
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={onInputChange}
                min="0"
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                  validationError && validationError.includes('stock')
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-purple-500'
                }`}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={onInputChange}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                  validationError && validationError.includes('category')
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-purple-500'
                }`}
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={onInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <input type="file" onChange={onImageChange} accept="image/*"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            {formData.image && (
              <p className="text-sm text-gray-500 mt-1">Selected: {formData.image.name}</p>
            )}
          </div>

          {/* Validation Error Display */}
          {validationError && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              disabled={submitting}>Cancel</button>
            <button type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={submitting || !!validationError}>
              {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Saving...</>) : (<><Save className="w-4 h-4" />{isEdit ? 'Update' : 'Create'} Product</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form validation
  const [validationError, setValidationError] = useState('')

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    status: 'active',
    category: '',
    stock_quantity: '',
    image: null
  })

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

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      price: '',
      status: 'active',
      category: '',
      stock_quantity: '',
      image: null
    })
    setValidationError('')
  }, [])

  // Check if product name already exists (case-insensitive)
  const isDuplicateProduct = useCallback((name: string, excludeId?: number): boolean => {
    const trimmedName = name.trim().toLowerCase()
    return products.some(product =>
      product.name.toLowerCase() === trimmedName &&
      product.id !== excludeId
    )
  }, [products])

  // Validate form data
  const validateForm = useCallback((): boolean => {
    const trimmedName = formData.name.trim()

    if (!trimmedName) {
      setValidationError('Please enter a product name')
      return false
    }

    if (trimmedName.length < 2) {
      setValidationError('Product name must be at least 2 characters long')
      return false
    }

    if (trimmedName.length > 100) {
      setValidationError('Product name must be less than 100 characters')
      return false
    }

    if (!formData.category) {
      setValidationError('Please select a category')
      return false
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setValidationError('Please enter a valid price greater than 0')
      return false
    }

    if (parseFloat(formData.price) > 999999.99) {
      setValidationError('Price cannot exceed ₹999,999.99')
      return false
    }

    if (formData.stock_quantity && parseFloat(formData.stock_quantity) < 0) {
      setValidationError('Stock quantity cannot be negative')
      return false
    }

    // Check for duplicates globally
    const excludeId = editingProduct?.id
    if (isDuplicateProduct(trimmedName, excludeId)) {
      setValidationError('A product with this name already exists')
      return false
    }

    setValidationError('')
    return true
  }, [formData, editingProduct, isDuplicateProduct])

  const handleAddProduct = useCallback(() => {
    resetForm()
    setShowAddModal(true)
  }, [resetForm])

  const handleEditProduct = useCallback((product: Product) => {
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
    setValidationError('')
    setShowEditModal(true)
  }, [])

  const handleSubmitProduct = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form before submitting
    if (!validateForm()) {
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

      let response: { data: Product }

      if (editingProduct) {
        response = await api.patch<{ data: Product }>(`admin/products/${editingProduct.id}/`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setProducts(products.map(p =>
          p.id === editingProduct.id ? response.data : p
        ))
        setShowEditModal(false)
      } else {
        response = await api.post<{ data: Product }>('admin/products/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setProducts([response.data, ...products])
        setShowAddModal(false)
      }

      resetForm()
      setEditingProduct(null)
    } catch (err: any) {
      console.error('Failed to save product:', err)

      // Handle specific duplicate error from backend
      if (err.response?.status === 400) {
        const errorData = err.response?.data
        if (errorData?.name?.some((msg: string) => msg.toLowerCase().includes('already exists')) ||
            errorData?.detail?.toLowerCase().includes('already exists') ||
            errorData?.non_field_errors?.some((msg: string) => msg.toLowerCase().includes('already exists'))) {
          setValidationError('A product with this name already exists')
        } else {
          alert(`Failed to save product: ${errorData?.detail || JSON.stringify(errorData) || 'Unknown error'}`)
        }
      } else {
        alert(`Failed to save product: ${err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Unknown error'}`)
      }
    } finally {
      setSubmitting(false)
    }
  }, [formData, editingProduct, validateForm, products, resetForm])

  const toggleProductStatus = async (productId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      await api.patch(`admin/products/${productId}/`, { status: newStatus })
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
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return
    try {
      await api.delete(`admin/products/${productId}/`)
      setProducts(products.filter(product => product.id !== productId))
    } catch (err: any) {
      console.error('Failed to delete product:', err)
      alert(`Failed to delete product: ${err.response?.data?.detail || 'Unknown error'}`)
    }
  }

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('')
    }
  }, [validationError])

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, image: file }))
  }, [])

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false)
    resetForm()
  }, [resetForm])

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false)
    setEditingProduct(null)
    resetForm()
  }, [resetForm])

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
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 block mx-auto" type="button">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <button onClick={handleAddProduct}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2" type="button">
          <Plus className="w-4 h-4" />
         <b> Add Product</b>
        </button>
      </div>
      <div className="mb-6 space-y-4 md:space-y-0 md:flex md:gap-4 md:items-center">
        <div className="flex-1">
          <input type="text" placeholder="Search products by name or category..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setStatusFilter('all')} type="button"
            className={`px-4 py-2 rounded-lg font-medium ${statusFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            All ({products.length})
          </button>
          <button onClick={() => setStatusFilter('active')} type="button"
            className={`px-4 py-2 rounded-lg font-medium ${statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Active ({products.filter(p => p.status === 'active').length})
          </button>
          <button onClick={() => setStatusFilter('inactive')} type="button"
            className={`px-4 py-2 rounded-lg font-medium ${statusFilter === 'inactive' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            Inactive ({products.filter(p => p.status === 'inactive').length})
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm || statusFilter !== 'all' ? 'No products match your filters' : 'No products found'}
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
                    <button onClick={() => toggleProductStatus(product.id, product.status)} type="button"
                      className={`p-2 rounded-lg transition-colors ${product.status === 'active' ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                      title={`${product.status === 'active' ? 'Deactivate' : 'Activate'} product`}>
                      {product.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleEditProduct(product)} type="button"
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteProduct(product.id)} type="button"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.image ? (
                  <img src={product.image} alt={product.name}
                    className="w-full h-32 object-cover rounded-lg bg-gray-100" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="text-gray-600 text-sm line-clamp-2">
                  {product.description}
                </div>
                <div className="text-base font-medium text-gray-900">₹{product.price}</div>
                <div className="text-sm text-gray-500">Category: {product.category_name}</div>
                <div className="text-sm text-gray-500">Stock: {product.available_stock}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductModal 
        isOpen={showAddModal} 
        onClose={handleCloseAddModal} 
        title="Add Product"
        formData={formData}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmitProduct}
        categories={categories}
        validationError={validationError}
        submitting={submitting}
      />
      
      <ProductModal 
        isOpen={showEditModal} 
        onClose={handleCloseEditModal} 
        title="Edit Product" 
        isEdit
        formData={formData}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmitProduct}
        categories={categories}
        validationError={validationError}
        submitting={submitting}
      />
    </div>
  )
}