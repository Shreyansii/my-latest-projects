'use client'
import { useEffect, useState } from 'react'
import api from '../../../../api/axios' // adjust path if needed
import { Loader2, Plus, Edit, Trash2, Tag, X, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Category {
  id: number
  name: string
}

interface CategoryFormData {
  name: string
}

interface ApiResponse {
  results?: Category[]
  [key: string]: any
}

interface ApiError {
  response?: {
    status?: number
    data?: {
      detail?: string
      [key: string]: any
    }
  }
  message?: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState<CategoryFormData>({
    name: ''
  })

  // Filtered categories based on search
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await api.get<ApiResponse>('admin/categories/')
      const categoriesData = res.data.results || (Array.isArray(res.data) ? res.data : [])
      setCategories(categoriesData)
    } catch (error) {
      const err = error as ApiError
      console.error('Fetch categories error:', err)
      if (err.response?.status === 403) {
        setError('Access denied. Admin authentication required.')
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please login as admin.')
      } else {
        setError(`Failed to load categories: ${err.response?.status || 'Network Error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '' })
  }

  const handleAddCategory = () => {
    resetForm()
    setShowAddModal(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name })
    setShowEditModal(true)
  }

  const handleSubmitCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Please enter a category name')
      return
    }

    setSubmitting(true)
    try {
      const submitData = {
        name: formData.name.trim()
      }

      let response: { data: Category }
      if (editingCategory) {
        // Update existing category
        response = await api.patch<Category>(`admin/categories/${editingCategory.id}/`, submitData)
        
        // Update local state
        setCategories(categories.map(c => 
          c.id === editingCategory.id ? response.data : c
        ))
        setShowEditModal(false)
      } else {
        // Create new category
        response = await api.post<Category>('admin/categories/', submitData)
        
        // Add to local state
        setCategories([response.data, ...categories])
        setShowAddModal(false)
      }

      resetForm()
      setEditingCategory(null)
    } catch (error) {
      const err = error as ApiError
      console.error('Failed to save category:', err)
      const errorMessage = err.response?.data?.detail || 
                          (err.response?.data ? JSON.stringify(err.response.data) : null) || 
                          err.message || 
                          'Unknown error'
      alert(`Failed to save category: ${errorMessage}`)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone and may affect associated products.')) {
      return
    }

    try {
      await api.delete(`admin/categories/${categoryId}/`)
      setCategories(categories.filter(category => category.id !== categoryId))
    } catch (error) {
      const err = error as ApiError
      console.error('Failed to delete category:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Unknown error'
      alert(`Failed to delete category: ${errorMessage}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    resetForm()
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingCategory(null)
    resetForm()
  }

  // Modal Component
  const CategoryModal = ({ isOpen, onClose, title, isEdit = false }: { 
    isOpen: boolean
    onClose: () => void
    title: string
    isEdit?: boolean 
  }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmitCategory} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name"
                required
                autoFocus
              />
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
                    {isEdit ? 'Update' : 'Create'} Category
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
          type="button"
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
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <button 
          onClick={handleAddCategory}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          type="button"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Categories Display */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm 
              ? 'No categories match your search' 
              : 'No categories found'
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={handleAddCategory}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              type="button"
            >
              Create your first category
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Tag className="w-5 h-5" />
              <span className="font-medium">
                Total Categories: {categories.length}
                {searchTerm && ` (${filteredCategories.length} filtered)`}
              </span>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-600" />
                      {category.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      {/* Edit Button */}
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        type="button"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {/* Delete Button */}
                      <button 
                        onClick={() => deleteCategory(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-2">
                  <div className="text-sm text-gray-500">
                    Category ID: {category.id}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <CategoryModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        title="Add New Category"
      />
      
      <CategoryModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit Category"
        isEdit={true}
      />
    </div>
  )
}