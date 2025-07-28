'use client'
import React, { useEffect, useState } from 'react'
import api from '../../../../api/axios' 
import { Loader2, Plus, Edit, Trash2, Users, X, Save, Shield, User, Crown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'customer' | 'superadmin'
  is_active: boolean
  date_joined: string
  last_login: string | null
}

interface UserFormData {
  username: string
  email: string
  password: string
  role: 'admin' | 'customer' | 'superadmin'
}

interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
}

interface ApiError {
  response?: {
    status?: number
    data?: {
      detail?: string
      [key: string]: any
    }
  }
}

type RoleFilter = 'all' | 'admin' | 'customer' | 'superadmin'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [submitting, setSubmitting] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    role: 'customer'
  })

  // Filtered users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true)
      const res: ApiResponse<User[] | { results: User[] }> = await api.get('admin/users/')
      const userData: User[] = Array.isArray(res.data) ? res.data : res.data.results || []
      setUsers(userData)
    } catch (err) {
      const apiError = err as ApiError
      console.error('Fetch users error:', apiError)
      if (apiError.response?.status === 403) {
        setError('Access denied. Admin authentication required.')
      } else if (apiError.response?.status === 401) {
        setError('Authentication required. Please login as admin.')
      } else {
        setError(`Failed to load users: ${apiError.response?.status || 'Network Error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = (): void => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'customer'
    })
  }

  const handleAddUser = (): void => {
    resetForm()
    setShowAddModal(true)
  }

  const handleEditUser = (user: User): void => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: '', //for security
      role: user.role
    })
    setShowEditModal(true)
  }

  const handleSubmitUser = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!formData.username.trim() || !formData.email.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (!editingUser && !formData.password.trim()) {
      alert('Password is required for new users')
      return
    }

    setSubmitting(true)
    try {
      const submitData: Partial<UserFormData> = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        role: formData.role
      }

      if (formData.password.trim()) {
        submitData.password = formData.password
      }

      let response: ApiResponse<User>
      if (editingUser) {
        // Update existing user
        response = await api.patch(`admin/users/${editingUser.id}/`, submitData)
        
        // Update local state
        setUsers(users.map(u => 
          u.id === editingUser.id ? response.data : u
        ))
        setShowEditModal(false)
      } else {
        // Create new user
        response = await api.post('admin/users/', submitData)
        
        // Add to local state
        setUsers([response.data, ...users])
        setShowAddModal(false)
      }

      resetForm()
      setEditingUser(null)
    } catch (err) {
      const apiError = err as ApiError
      console.error('Failed to save user:', apiError)
      const errorMessage = apiError.response?.data?.detail || 
                          JSON.stringify(apiError.response?.data) || 
                          'Unknown error'
      alert(`Failed to save user: ${errorMessage}`)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleUserStatus = async (userId: number, currentStatus: boolean): Promise<void> => {
    try {
      const response: ApiResponse<User> = await api.patch(`admin/users/${userId}/`, {
        is_active: !currentStatus
      })

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_active: !currentStatus }
          : user
      ))
    } catch (err) {
      const apiError = err as ApiError
      console.error('Failed to update user status:', apiError)
      alert(`Failed to update user status: ${apiError.response?.data?.detail || 'Unknown error'}`)
    }
  }

  const deleteUser = async (userId: number): Promise<void> => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response: ApiResponse = await api.delete(`admin/users/${userId}/`)
      setUsers(users.filter(user => user.id !== userId))
    } catch (err) {
      const apiError = err as ApiError
      console.error('Failed to delete user:', apiError)
      alert(`Failed to delete user: ${apiError.response?.data?.detail || 'Unknown error'}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getRoleIcon = (role: string): React.JSX.Element => {
    switch (role) {
      case 'superadmin': return <Crown className="w-4 h-4 text-yellow-600" />
      case 'admin': return <Shield className="w-4 h-4 text-blue-600" />
      case 'customer': return <User className="w-4 h-4 text-green-600" />
      default: return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'superadmin': return 'bg-yellow-100 text-yellow-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'customer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Modal Component
  const UserModal = ({ isOpen, onClose, title, isEdit = false }: { 
    isOpen: boolean
    onClose: () => void
    title: string
    isEdit?: boolean 
  }): React.JSX.Element | null => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmitUser} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {!isEdit && '*'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={!isEdit}
                placeholder={isEdit ? "Leave blank to keep current password" : ""}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
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
                    {isEdit ? 'Update' : 'Create'} User
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
        <h1 className="text-2xl font-bold">Users Management</h1>
        <button 
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4 md:space-y-0 md:flex md:gap-4 md:items-center">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Role Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              roleFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('customer')}
            className={`px-4 py-2 rounded-lg font-medium ${
              roleFilter === 'customer' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Customers ({users.filter(u => u.role === 'customer').length})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-4 py-2 rounded-lg font-medium ${
              roleFilter === 'admin' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Admins ({users.filter(u => u.role === 'admin').length})
          </button>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm || roleFilter !== 'all' 
              ? 'No users match your filters' 
              : 'No users found'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {user.username}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {/* Status Toggle Button */}
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.is_active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={`${user.is_active ? 'Deactivate' : 'Activate'} user`}
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    
                    {/* Edit Button */}
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {user.email}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400 pt-2 border-t space-y-1">
                    <p>Joined: {new Date(user.date_joined).toLocaleDateString()}</p>
                    {user.last_login && (
                      <p>Last login: {new Date(user.last_login).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <UserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
      />
      
      <UserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        isEdit={true}
      />
    </div>
  )
}