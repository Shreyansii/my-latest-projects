'use client'

import { useEffect, useState } from 'react'
import api from '../../../../api/axios'
import { Loader2, Plus, Edit, Trash2, Save, X, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface User {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  date_joined: string
  last_login: string | null
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  })
  const [validationError, setValidationError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users/')
      console.log('Fetched users:', res.data) // Debug log
      setUsers(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isDuplicateUser = (username: string, email: string, excludeId?: number): boolean => {
    const trimmedUsername = username.trim().toLowerCase()
    const trimmedEmail = email.trim().toLowerCase()
    return users.some(user =>
      (user.username.toLowerCase() === trimmedUsername || user.email.toLowerCase() === trimmedEmail) &&
      user.id !== excludeId
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationError) setValidationError('')
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({ username: '', email: '', password: '', role: '' })
    setShowModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({ username: user.username, email: user.email, password: '', role: user.role })
    setShowModal(true)
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }
    
    try {
      await api.delete(`/admin/users/${id}/`)
      // Refetch users to ensure sync
      await fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleSubmitUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedUsername = formData.username.trim()
    const trimmedEmail = formData.email.trim()

    if (!trimmedUsername || !trimmedEmail) {
      setValidationError('Please fill in all required fields')
      return
    }

    if (!editingUser && !formData.password.trim()) {
      setValidationError('Password is required for new users')
      return
    }

    if (isDuplicateUser(trimmedUsername, trimmedEmail, editingUser?.id)) {
      setValidationError('Username or email already exists')
      return
    }

    setValidationError('')
    setSubmitting(true)

    try {
      if (editingUser) {
        const res = await api.put(`/admin/users/${editingUser.id}/`, {
          username: trimmedUsername,
          email: trimmedEmail,
          role: formData.role,
        })
        console.log('Update response:', res.data) // Debug log
        
        // Instead of trying to merge data, just refetch all users to ensure sync
        await fetchUsers()
      } else {
        const res = await api.post('/admin/users/', {
          username: trimmedUsername,
          email: trimmedEmail,
          password: formData.password,
          role: formData.role,
        })
        console.log('Create response:', res.data) // Debug log
        
        // Refetch users to ensure we have the latest data with proper timestamps
        await fetchUsers()
      }
      setShowModal(false)
    } catch (error) {
      console.error('Error saving user:', error)
      setValidationError('Failed to save user. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Users</CardTitle>
          <button
            onClick={handleAddUser}
            className="flex items-center px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-1" /> <b>Add User</b>
          </button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin h-6 w-6" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(user => (
                <div
                  key={user.id}
                  className="border rounded p-3 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600 capitalize">Role: {user.role}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Created: {formatDate(user.date_joined)}</p>
                      <p>Last Login: {formatDate(user.last_login)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button onClick={() => handleEditUser(user)}>
                      <Edit className="w-4 h-4 text-purple-600" />
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {validationError && (
                <div className="flex items-center text-red-600 text-sm gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationError}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsersPage