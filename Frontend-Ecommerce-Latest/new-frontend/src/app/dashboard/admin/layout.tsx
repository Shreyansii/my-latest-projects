
'use client'

import { ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaBars } from 'react-icons/fa'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className={`w-64 bg-white shadow-lg border-r p-6 transition-all ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <h2 className="text-2xl font-bold text-blue-600 mb-8">Admin Dashboard</h2>
        <nav className="flex flex-col gap-4">
          <Button variant="ghost" className="justify-start text-gray-700 hover:bg-gray-100" onClick={() => router.push('/dashboard/admin')}>📊 Dashboard</Button>
          <Button variant="ghost" className="justify-start text-gray-700 hover:bg-gray-100" onClick={() => router.push('/dashboard/admin/products')}>📦 Products</Button>
          <Button variant="ghost" className="justify-start text-gray-700 hover:bg-gray-100" onClick={() => router.push('/dashboard/admin/orders')}>📝 Orders</Button>
          <Button variant="ghost" className="justify-start text-gray-700 hover:bg-gray-100" onClick={() => router.push('/dashboard/admin/users')}>👥 Users</Button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
              <FaBars />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}
