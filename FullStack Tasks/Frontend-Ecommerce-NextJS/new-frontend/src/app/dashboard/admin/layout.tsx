'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: '🏠', path: '/dashboard/admin' },
    { name: 'Products', icon: '📦', path: '/dashboard/admin/products' },
    { name: 'Categories', icon: '🏷️', path: '/dashboard/admin/categories' },
    { name: 'Orders', icon: '🛒', path: '/dashboard/admin/orders' },
    { name: 'Users', icon: '👤', path: '/dashboard/admin/users' },
  ];

  const handleLogout = () => {
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Mobile Sidebar (Sheet) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="bg-white shadow">
              <FaBars className="text-black" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-black text-white w-64 p-6">
            <div className="flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={cn(
                      'justify-start px-4 py-2 text-base rounded-xl border',
                      isActive(item.path)
                        ? 'bg-white text-black border-white'
                        : 'text-white border-white/30 hover:bg-white/10 hover:border-white'
                    )}
                    onClick={() => {
                      router.push(item.path);
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="mr-3">{item.icon}</span> {item.name}
                  </Button>
                ))}
              </nav>
              <div className="mt-auto pt-4 border-t border-white/20">
                <Button
                  variant="ghost"
                  className="w-full justify-start bg-red-600 text-white hover:bg-red-700 px-4 py-2 text-base rounded-xl"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="mr-2" /> Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen sticky top-0 w-64 flex-col bg-black text-white shadow-lg border-r border-black p-6">
        <h2 className="text-2xl font-bold mb-8 text-center">Admin Panel</h2>
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                'justify-start text-base px-4 py-2 rounded-xl border',
                isActive(item.path)
                  ? 'bg-white text-black font-semibold border-white'
                  : 'text-white border-white/30 hover:bg-white/10 hover:border-white'
              )}
              onClick={() => router.push(item.path)}
            >
              <span className="mr-3">{item.icon}</span> {item.name}
            </Button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-white/20">
          <Button
            variant="ghost"
            className="w-full justify-start bg-red-600 text-white hover:bg-red-700 px-4 py-2 text-base rounded-xl"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5">{children}</main>
    </div>
  );
}
