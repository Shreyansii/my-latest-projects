'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import {
  FaUsers,
  FaBoxOpen,
  FaClipboardList,
  FaChartPie,
  FaTags,
} from 'react-icons/fa'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Menu } from 'lucide-react'

interface DashboardData {
  total_users: number
  total_products: number
  pending_orders: number
}

const COLORS = ['#8B5CF6', '#A78BFA', '#C4B5FD']

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const toggleSidebar = () => {
    const event = new CustomEvent('toggleSidebar')
    window.dispatchEvent(event)
  }

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
      <div className="flex items-center justify-center h-[70vh] bg-gray-50">
        <Loader2 className="animate-spin w-8 h-8 text-purple-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <p className="text-center text-red-500 mt-10 pt-20">{error}</p>
      </div>
    )
  }

  const chartData = [
    { name: 'Users', value: data?.total_users || 0 },
    { name: 'Products', value: data?.total_products || 0 },
    { name: 'Orders', value: data?.pending_orders || 0 },
  ]

  const navButtons = [
    { label: '+ Add Product', path: '/dashboard/admin/products' },
    { label: 'Manage Categories', path: '/dashboard/admin/categories', icon: <FaTags /> },
    { label: '📦 View Orders', path: '/dashboard/admin/orders' },
    { label: '👥 Manage Users', path: '/dashboard/admin/users' },
  ]

  return (
    <div className="relative flex-1 p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 text-lg mt-2">Centralized Control Panel</p>
      </div>

      {/* Buttons for Desktop View */}
      <div className="hidden md:flex flex-wrap justify-center gap-4 mb-12">
        {navButtons.map((btn, i) => (
          <Button
            key={i}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 border-0"
            onClick={() => router.push(btn.path)}
          >
            {btn.icon && <span className="mr-2">{btn.icon}</span>}
            {btn.label}
          </Button>
        ))}
      </div>

      {/*  Buttons for Mobile View */}
      <div className="md:hidden flex flex-col gap-3 mb-10 px-4">
        {navButtons.map((btn, i) => (
          <Button
            key={i}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl text-base font-medium shadow-sm border-0 flex items-center justify-center"
            onClick={() => router.push(btn.path)}
          >
            {btn.icon && <span className="mr-2">{btn.icon}</span>}
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            title: 'Total Users',
            value: data?.total_users,
            description: 'All registered users',
            icon: <FaUsers className="text-purple-600" />,
            bgColor: 'from-purple-50 to-purple-100',
            borderColor: 'border-purple-200'
          },
          {
            title: 'Total Products',
            value: data?.total_products,
            description: 'Items in catalog',
            icon: <FaBoxOpen className="text-purple-600" />,
            bgColor: 'from-indigo-50 to-indigo-100',
            borderColor: 'border-indigo-200'
          },
          {
            title: 'Pending Orders',
            value: data?.pending_orders,
            description: 'Orders not yet fulfilled',
            icon: <FaClipboardList className="text-purple-600" />,
            bgColor: 'from-violet-50 to-violet-100',
            borderColor: 'border-violet-200'
          },
        ].map((card, i) => (
          <Card
            key={i}
            className={`bg-gradient-to-br ${card.bgColor} shadow-lg rounded-2xl border ${card.borderColor} hover:shadow-xl transition-shadow duration-300`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-gray-800 text-lg font-semibold">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {card.icon}
                </div>
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-800 mb-1">{card.value}</p>
              <p className="text-gray-600 text-sm">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="bg-white shadow-lg rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-gray-800 text-lg font-semibold">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FaChartPie className="text-purple-600" />
              </div>
              Data Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="bg-white shadow-lg rounded-2xl border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-800 text-lg font-semibold">Stats Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
