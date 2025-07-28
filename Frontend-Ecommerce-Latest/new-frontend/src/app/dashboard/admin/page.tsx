
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FaUsers, FaBoxOpen, FaClipboardList, FaBars, FaChartPie, FaTags } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardData {
  total_users: number
  total_products: number
  pending_orders: number
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B']

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const router = useRouter()

  const fetchDashboard = async () => {
    setLoading(true)
    setError('')

    try {
      const token = Cookies.get('access_token')
      const res = await axios.get<DashboardData>('http://localhost:8000/api/dashboard/summary/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setData(res.data)
    } catch (err) {
      setError('Failed to fetch dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    )
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>
  }

  const chartData = [
    { name: 'Users', value: data?.total_users || 0 },
    { name: 'Products', value: data?.total_products || 0 },
    { name: 'Orders', value: data?.pending_orders || 0 },
  ]

  return (
    <div className="flex-1 p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden">
            <FaBars />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        </div>
        <Input
          type="text"
          placeholder="Search by keyword..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-white border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <FaUsers /> Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{data?.total_users}</p>
            <p className="text-gray-500">All registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <FaBoxOpen /> Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{data?.total_products}</p>
            <p className="text-gray-500">Items in catalog</p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <FaClipboardList /> Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{data?.pending_orders}</p>
            <p className="text-gray-500">Orders not yet fulfilled</p>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      <div className="bg-white border rounded-lg shadow-sm p-6 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <FaChartPie className="text-purple-700" />
          <h2 className="text-lg font-semibold text-gray-800">Data Distribution</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Action Buttons - Added Categories Button */}
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Button 
          onClick={() => {
            console.log('Navigating to: /dashboard/admin/products')
            router.push('/dashboard/admin/products')
          }} 
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          + Add New Product
        </Button>
        <Button 
          onClick={() => {
            console.log('Navigating to: /dashboard/admin/categories')
            router.push('/dashboard/admin/categories')
          }} 
          className="bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2"
        >
          <FaTags /> Manage Categories
        </Button>
        <Button 
          onClick={() => {
            console.log('Navigating to: /dashboard/admin/orders')
            router.push('/dashboard/admin/orders')
          }} 
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          📦 View Orders
        </Button>
        <Button 
          onClick={() => {
            console.log('Navigating to: /dashboard/admin/users')
            router.push('/dashboard/admin/users')
          }} 
          className="bg-pink-600 text-white hover:bg-pink-700"
        >
          👥 Manage Users
        </Button>
      </div>
    </div>
  )
}