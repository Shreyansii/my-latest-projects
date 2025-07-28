// 'use client'
// import { useEffect, useState } from 'react'
// import api from '../../../../api/axios' 
// import { Loader2 } from 'lucide-react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// interface Order {
//   id: number
//   customer: string | { name: string; email: string } 
//   total: string | number
//   status: 'pending' | 'shipped' | 'delivered'
//   created_at: string
//   [key: string]: any 
// }

// // Type for API response
// interface ApiResponse {
//   results?: Order[]
//   count?: number
//   next?: string | null
//   previous?: string | null
// }

// // Type for direct array response
// type OrdersResponse = Order[] | ApiResponse

// export default function OrdersPage() {
//   const [orders, setOrders] = useState<Order[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         console.log('Fetching from:', api.defaults.baseURL + 'admin/orders/')
//         const res = await api.get<OrdersResponse>('admin/orders/')
        
//         // Log the full response to understand the structure
//         console.log('Full API Response:', res.data)
//         console.log('Response type:', typeof res.data)
//         console.log('Is array?', Array.isArray(res.data))
        
//         // Handle different response structures
//         let ordersData: Order[];
//         if (res.data && typeof res.data === 'object' && 'results' in res.data) {
//           // Paginated response
//           ordersData = res.data.results || [];
//         } else if (Array.isArray(res.data)) {
//           // Direct array response
//           ordersData = res.data;
//         } else {
//           console.error('Unexpected response structure:', res.data);
//           throw new Error('Unexpected response format');
//         }
        
//         console.log('Orders data:', ordersData);
//         setOrders(ordersData)
//       } catch (err: any) {
//         console.error('Fetch error:', err)
//         console.error('Error response:', err.response?.data)
//         console.error('Error status:', err.response?.status)
//         setError(`Failed to load orders: ${err.response?.status || 'Network Error'}`)
//       } finally {
//         setLoading(false)
//       }
//     }
    
//     fetchOrders()
//   }, [])

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-[60vh]">
//         <Loader2 className="w-8 h-8 animate-spin text-primary" />
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <p className="text-red-500 text-center mt-10">{error}</p>
//         <button 
//           onClick={() => window.location.reload()} 
//           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 block mx-auto"
//         >
//           Retry
//         </button>
//       </div>
//     )
//   }

//   // Handle empty orders
//   if (!orders || orders.length === 0) {
//     return (
//       <div className="p-6">
//         <h1 className="text-2xl font-bold mb-6">All Admin Orders</h1>
//         <p className="text-gray-500 text-center mt-10">No orders found.</p>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">All Orders ({orders.length})</h1>
//       <div className="grid gap-4">
//         {orders.map((order) => (
//           <Card key={order.id} className="bg-white border shadow-sm">
//             <CardHeader>
//               <CardTitle className="text-blue-700">Order #{order.id}</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p>
//                 <strong>Customer:</strong>{' '}
//                 {typeof order.customer === 'string' 
//                   ? order.customer 
//                   : order.customer?.name || order.customer?.email || 'N/A'
//                 }
//               </p>
//               <p><strong>Total:</strong> ${order.total}</p>
//               <p><strong>Status:</strong> {order.status}</p>
//               <p className="text-sm text-gray-500">
//                 Placed on: {new Date(order.created_at).toLocaleString()}
//               </p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )
// }
'use client'
import { useEffect, useState } from 'react'
import api from '../../../../api/axios' 
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Order {
  id: number
  customer: number // This is the customer ID
  customer_name: string // This is what the serializer returns
  total_amount: string | number // This is what the serializer returns (not 'total')
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  items?: any[] // Array of order items
  [key: string]: any
}

// Type for API response
interface ApiResponse {
  results?: Order[]
  count?: number
  next?: string | null
  previous?: string | null
}

// Type for direct array response
type OrdersResponse = Order[] | ApiResponse

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('Fetching from:', api.defaults.baseURL + 'admin/orders/')
        const res = await api.get<OrdersResponse>('admin/orders/')
        
        // Logging full response to understand the structure
        console.log('Full API Response:', res.data)
        console.log('Response type:', typeof res.data)
        console.log('Is array?', Array.isArray(res.data))
        
        // Handle different response structures
        let ordersData: Order[];
        if (res.data && typeof res.data === 'object' && 'results' in res.data) {
          // Paginated response
          ordersData = res.data.results || [];
        } else if (Array.isArray(res.data)) {
          // Direct array response
          ordersData = res.data;
        } else {
          console.error('Unexpected response structure:', res.data);
          throw new Error('Unexpected response format');
        }
        
        console.log('Orders data:', ordersData);
        
       
        if (ordersData.length > 0) {
          console.log('First order structure:', ordersData[0]);
        }
        
        setOrders(ordersData)
      } catch (err: any) {
        console.error('Fetch error:', err)
        console.error('Error response:', err.response?.data)
        console.error('Error status:', err.response?.status)
        
        // More detailed error message
        if (err.response?.status === 403) {
          setError('Access denied. Admin authentication required.')
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please login as admin.')
        } else {
          setError(`Failed to load orders: ${err.response?.status || 'Network Error'}`)
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
  }, [])

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

  // Handle empty orders
  if (!orders || orders.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">All Admin Orders</h1>
        <p className="text-gray-500 text-center mt-10">No orders found.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Orders ({orders.length})</h1>
      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-700">Order #{order.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Customer:</strong>{' '}
                {order.customer_name || `Customer ID: ${order.customer}` || 'N/A'}
              </p>
              <p>
                <strong>Total:</strong> ${order.total_amount || '0.00'}
              </p>
              <p>
                <strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </p>
              {order.items && order.items.length > 0 && (
                <div className="relative group">
                  <p className="cursor-help">
                    <strong>Items:</strong> 
                    <span className="ml-1 text-blue-600 underline decoration-dotted">
                      {order.items.length}
                    </span>
                  </p>
                  
                  {/* Tooltip */}
                  <div className="absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    {/* Arrow */}
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                    
                    <div className="font-semibold mb-2">Order Items:</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {order.items.map((item, index) => (
                        <div key={index} className="text-xs">
                          <span className="font-medium">
                            {item.quantity}x {item.product_name || `Product #${item.product}`}
                          </span>
                          <span className="text-gray-300 ml-2">
                            ${item.price || '0.00'} each
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Placed on: {new Date(order.created_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}