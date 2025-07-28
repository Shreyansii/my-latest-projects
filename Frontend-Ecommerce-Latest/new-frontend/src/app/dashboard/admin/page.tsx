// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { getCookie } from 'cookies-next';
// import { 
//   ShoppingCart, 
//   Package, 
//   Heart, 
//   User, 
//   CreditCard, 
//   MapPin, 
//   Clock, 
//   Eye, 
//   Star,
//   Plus,
//   Minus,
//   LogOut,
//   Menu,
//   Search,
//   Filter,
//   X
// } from 'lucide-react';

// // Types
// interface User {
//   id: number;
//   username: string;
//   email: string;
//   role: 'admin' | 'customer' | 'superadmin';
// }

// interface Category {
//   id: number;
//   name: string;
// }

// interface Product {
//   id: number;
//   name: string;
//   description: string;
//   price: string;
//   status: 'active' | 'inactive';
//   category: number;
//   image?: string;
//   stock_quantity: number;
//   reserved_stock: number;
//   current_stock: number;
//   available_stock: number;
//   created_at: string;
//   updated_at: string;
// }

// interface Order {
//   id: number;
//   customer: number;
//   status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
//   total_amount: string;
//   created_at: string;
//   updated_at: string;
//   items: OrderItem[];
// }

// interface OrderItem {
//   id: number;
//   product: number;
//   quantity: number;
//   price: string;
//   total_price: string;
// }

// interface CartItem {
//   product: Product;
//   quantity: number;
// }

// // API Client
// const API_BASE_URL = 'http://localhost:8000/api';

// class ApiClient {
//   private getAuthHeaders() {
//     const token = getCookie('access_token');
//     return {
//       'Content-Type': 'application/json',
//       ...(token && { Authorization: `Bearer ${token}` }),
//     };
//   }

//   async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
//     const url = `${API_BASE_URL}${endpoint}`;
//     const response = await fetch(url, {
//       ...options,
//       headers: {
//         ...this.getAuthHeaders(),
//         ...options.headers,
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return response.json();
//   }

//   async getUserDetails() {
//     return this.request<User>('/user/');
//   }

//   // Public endpoints
//   async getCategories() {
//     return this.request<Category[]>('/browse/categories/');
//   }

//   async getProducts() {
//     return this.request<Product[]>('/browse/products/');
//   }

//   // Customer orders
//   async getMyOrders() {
//     return this.request<Order[]>('/customer/orders/');
//   }

//   async createOrder(orderData: { items: { product: number; quantity: number }[] }) {
//     return this.request<Order>('/customer/orders/', {
//       method: 'POST',
//       body: JSON.stringify(orderData),
//     });
//   }
// }

// const apiClient = new ApiClient();

// export default function CustomerDashboard() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState('products');
//   const [user, setUser] = useState<User | null>(null);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
  
//   // Filter states
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState<string>('');
//   const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

//   // Cart modal
//   const [isCartOpen, setIsCartOpen] = useState(false);

//   useEffect(() => {
//     // Check if user is authenticated
//     const token = getCookie('access_token');
//     if (!token) {
//       router.push('/login');
//       return;
//     }
    
//     loadDashboardData();
//     loadCartFromStorage();
//   }, []);

//   useEffect(() => {
//     filterProducts();
//   }, [products, searchTerm, selectedCategory, priceRange]);

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);
//       const [userData, categoriesData, productsData, ordersData] = await Promise.all([
//         apiClient.getUserDetails(),
//         apiClient.getCategories(),
//         apiClient.getProducts(),
//         apiClient.getMyOrders(),
//       ]);
      
//       setUser(userData);
//       setCategories(categoriesData);
//       setProducts(productsData);
//       setOrders(ordersData);
//     } catch (error) {
//       console.error('Failed to load dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadCartFromStorage = () => {
//     const savedCart = localStorage.getItem('cart');
//     if (savedCart) {
//       setCart(JSON.parse(savedCart));
//     }
//   };

//   const saveCartToStorage = (cartItems: CartItem[]) => {
//     localStorage.setItem('cart', JSON.stringify(cartItems));
//   };

//   const filterProducts = () => {
//     let filtered = products;

//     // Search filter
//     if (searchTerm) {
//       filtered = filtered.filter(product =>
//         product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         product.description.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Category filter
//     if (selectedCategory) {
//       filtered = filtered.filter(product => product.category.toString() === selectedCategory);
//     }

//     // Price range filter
//     if (priceRange.min || priceRange.max) {
//       filtered = filtered.filter(product => {
//         const price = parseFloat(product.price);
//         const min = priceRange.min ? parseFloat(priceRange.min) : 0;
//         const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
//         return price >= min && price <= max;
//       });
//     }

//     setFilteredProducts(filtered);
//   };

//   const addToCart = (product: Product) => {
//     const existingItem = cart.find(item => item.product.id === product.id);
//     let newCart;

//     if (existingItem) {
//       newCart = cart.map(item =>
//         item.product.id === product.id
//           ? { ...item, quantity: Math.min(item.quantity + 1, product.available_stock) }
//           : item
//       );
//     } else {
//       newCart = [...cart, { product, quantity: 1 }];
//     }

//     setCart(newCart);
//     saveCartToStorage(newCart);
//   };

//   const removeFromCart = (productId: number) => {
//     const newCart = cart.filter(item => item.product.id !== productId);
//     setCart(newCart);
//     saveCartToStorage(newCart);
//   };

//   const updateCartQuantity = (productId: number, quantity: number) => {
//     if (quantity === 0) {
//       removeFromCart(productId);
//       return;
//     }

//     const newCart = cart.map(item =>
//       item.product.id === productId
//         ? { ...item, quantity: Math.min(quantity, item.product.available_stock) }
//         : item
//     );

//     setCart(newCart);
//     saveCartToStorage(newCart);
//   };

//   const getTotalPrice = () => {
//     return cart.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0).toFixed(2);
//   };

//   const handleCheckout = async () => {
//     if (cart.length === 0) return;

//     try {
//       const orderData = {
//         items: cart.map(item => ({
//           product: item.product.id,
//           quantity: item.quantity,
//         })),
//       };

//       await apiClient.createOrder(orderData);
      
//       // Clear cart
//       setCart([]);
//       saveCartToStorage([]);
//       setIsCartOpen(false);
      
//       // Refresh orders
//       loadDashboardData();
      
//       alert('Order placed successfully!');
//     } catch (error) {
//       console.error('Failed to place order:', error);
//       alert('Failed to place order. Please try again.');
//     }
//   };

//   const handleLogout = () => {
//     document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
//     localStorage.removeItem('cart');
//     router.push('/login');
//   };

//   const getStatusBadge = (status: string) => {
//     const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
//     const variants = {
//       pending: 'bg-yellow-100 text-yellow-800',
//       confirmed: 'bg-blue-100 text-blue-800',
//       shipped: 'bg-purple-100 text-purple-800',
//       delivered: 'bg-green-100 text-green-800',
//       cancelled: 'bg-red-100 text-red-800',
//     };
    
//     return (
//       <span className={`${baseClasses} ${variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}`}>
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </span>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Mobile sidebar backdrop */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
//         <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
//           <h1 className="text-xl font-bold text-gray-900">E-Commerce</h1>
//           <button
//             onClick={() => setSidebarOpen(false)}
//             className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>
        
//         <nav className="mt-6">
//           <div className="px-6 space-y-1">
//             {[
//               { id: 'products', name: 'Products', icon: Package },
//               { id: 'orders', name: 'My Orders', icon: ShoppingCart },
//               { id: 'profile', name: 'Profile', icon: User },
//             ].map((item) => {
//               const Icon = item.icon;
//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => setActiveTab(item.id)}
//                   className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
//                     activeTab === item.id
//                       ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
//                       : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//                   }`}
//                 >
//                   <Icon className="mr-3 h-5 w-5" />
//                   {item.name}
//                 </button>
//               );
//             })}
//           </div>
          
//           <div className="mt-auto px-6 py-6">
//             <button
//               onClick={handleLogout}
//               className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
//             >
//               <LogOut className="mr-3 h-5 w-5" />
//               Logout
//             </button>
//           </div>
//         </nav>
//       </div>

//       {/* Main content */}
//       <div className="lg:pl-64">
//         {/* Top bar */}
//         <div className="bg-white shadow-sm border-b border-gray-200">
//           <div className="px-6 py-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <button
//                   onClick={() => setSidebarOpen(true)}
//                   className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
//                 >
//                   <Menu className="h-5 w-5" />
//                 </button>
//                 <h2 className="ml-2 text-2xl font-bold text-gray-900">
//                   {activeTab === 'products' ? 'Products' : activeTab === 'orders' ? 'My Orders' : 'Profile'}
//                 </h2>
//               </div>
              
//               {/* Cart button */}
//               <button
//                 onClick={() => setIsCartOpen(true)}
//                 className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
//               >
//                 <ShoppingCart className="h-6 w-6" />
//                 {cart.length > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                     {cart.reduce((sum, item) => sum + item.quantity, 0)}
//                   </span>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Products Tab */}
//           {activeTab === 'products' && (
//             <div className="space-y-6">
//               {/* Filters */}
//               <div className="bg-white rounded-lg shadow p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                       <input
//                         type="text"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Search products..."
//                       />
//                     </div>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
//                     <select
//                       value={selectedCategory}
//                       onChange={(e) => setSelectedCategory(e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">All Categories</option>
//                       {categories.map((category) => (
//                         <option key={category.id} value={category.id.toString()}>
//                           {category.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
//                     <input
//                       type="number"
//                       value={priceRange.min}
//                       onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="$0"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
//                     <input
//                       type="number"
//                       value={priceRange.max}
//                       onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="$1000"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Products Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {filteredProducts.map((product) => (
//                   <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
//                     <div className="aspect-w-1 aspect-h-1 w-full">
//                       {product.image ? (
//                         <img
//                           src={`http://localhost:8000${product.image}`}
//                           alt={product.name}
//                           className="h-48 w-full object-cover"
//                         />
//                       ) : (
//                         <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
//                           <Package className="h-12 w-12 text-gray-400" />
//                         </div>
//                       )}
//                     </div>
                    
//                     <div className="p-4">
//                       <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
//                       <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      
//                       <div className="flex items-center justify-between mb-3">
//                         <span className="text-2xl font-bold text-blue-600">${product.price}</span>
//                         <span className="text-sm text-gray-500">
//                           Stock: {product.available_stock}
//                         </span>
//                       </div>
                      
//                       <button
//                         onClick={() => addToCart(product)}
//                         disabled={product.available_stock === 0}
//                         className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
//                           product.available_stock === 0
//                             ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                             : 'bg-blue-600 text-white hover:bg-blue-700'
//                         }`}
//                       >
//                         {product.available_stock === 0 ? 'Out of Stock' : 'Add to Cart'}
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {filteredProducts.length === 0 && (
//                 <div className="text-center py-12">
//                   <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
//                   <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Orders Tab */}
//           {activeTab === 'orders' && (
//             <div className="space-y-6">
//               <div className="bg-white rounded-lg shadow">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
//                 </div>
                
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {orders.map((order) => (
//                         <tr key={order.id}>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.total_amount}</td>
//                           <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {new Date(order.created_at).toLocaleDateString()}
//                           </td>
//                           <td className="px-6 py-4 text-sm text-gray-500">
//                             {order.items?.length || 0} items
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {orders.length === 0 && (
//                   <div className="text-center py-12">
//                     <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                     <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
//                     <p className="text-gray-600">Start shopping to see your orders here.</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Profile Tab */}
//           {activeTab === 'profile' && (
//             <div className="space-y-6">
//               <div className="bg-white rounded-lg shadow">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
//                 </div>
                
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
//                       <input
//                         type="text"
//                         value={user?.username || ''}
//                         disabled
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//                       <input
//                         type="email"
//                         value={user?.email || ''}
//                         disabled
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
//                       <input
//                         type="text"
//                         value={user?.role || ''}
//                         disabled
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 capitalize"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Order Summary Card */}
//               <div className="bg-white rounded-lg shadow">
//                 <div className="px-6 py-4 border-b border-gray-200">
//                   <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
//                 </div>
                
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
//                       <div className="text-sm text-gray-600">Total Orders</div>
//                     </div>
                    
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-yellow-600">
//                         {orders.filter(order => order.status === 'pending').length}
//                       </div>
//                       <div className="text-sm text-gray-600">Pending</div>
//                     </div>
                    
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-green-600">
//                         {orders.filter(order => order.status === 'delivered').length}
//                       </div>
//                       <div className="text-sm text-gray-600">Delivered</div>
//                     </div>
                    
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-red-600">
//                         {orders.filter(order => order.status === 'cancelled').length}
//                       </div>
//                       <div className="text-sm text-gray-600">Cancelled</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Cart Modal */}
//       {isCartOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
//                 <button
//                   onClick={() => setIsCartOpen(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
            
//             <div className="p-6 overflow-y-auto max-h-96">
//               {cart.length === 0 ? (
//                 <div className="text-center py-8">
//                   <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-600">Your cart is empty</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {cart.map((item) => (
//                     <div key={item.product.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
//                       <div className="flex-shrink-0">
//                         {item.product.image ? (
//                           <img
//                             src={`http://localhost:8000${item.product.image}`}
//                             alt={item.product.name}
//                             className="h-16 w-16 object-cover rounded-md"
//                           />
//                         ) : (
//                           <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center">
//                             <Package className="h-6 w-6 text-gray-400" />
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="flex-1 min-w-0">
//                         <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
//                         <p className="text-sm text-gray-500">${item.product.price}</p>
//                       </div>
                      
//                       <div className="flex items-center space-x-2">
//                         <button
//                           onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
//                           className="p-1 text-gray-400 hover:text-gray-600"
//                         >
//                           <Minus className="h-4 w-4" />
//                         </button>
                        
//                         <span className="text-sm font-medium text-gray-900 w-8 text-center">
//                           {item.quantity}
//                         </span>
                        
//                         <button
//                           onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
//                           disabled={item.quantity >= item.product.available_stock}
//                           className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
//                         >
//                           <Plus className="h-4 w-4" />
//                         </button>
                        
//                         <button
//                           onClick={() => removeFromCart(item.product.id)}
//                           className="p-1 text-red-400 hover:text-red-600 ml-2"
//                         >
//                           <X className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
            
//             {cart.length > 0 && (
//               <div className="px-6 py-4 border-t border-gray-200">
//                 <div className="flex justify-between items-center mb-4">
//                   <span className="text-lg font-semibold text-gray-900">Total:</span>
//                   <span className="text-lg font-bold text-blue-600">${getTotalPrice()}</span>
//                 </div>
                
//                 <button
//                   onClick={handleCheckout}
//                   className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
//                 >
//                   Checkout
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FaUsers, FaBoxOpen, FaClipboardList, FaBars, FaChartPie } from 'react-icons/fa'
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

      {/* Action Buttons - FIXED NAVIGATION PATHS */}
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