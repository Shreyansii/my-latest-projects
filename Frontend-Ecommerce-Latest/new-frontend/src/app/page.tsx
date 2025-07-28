'use client';

import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaShoppingBag, FaSignInAlt } from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  price: string;
  current_stock: number;
  image: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // ✅ Initialize router

  useEffect(() => {
    axios
      .get<Product[]>('http://localhost:8000/api/browse/products/')
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        if (err.code === 'ERR_NETWORK') {
          setError('Network Error: Cannot connect to server. Make sure Django is running on port 8000.');
        } else if (err.response?.status === 0) {
          setError('CORS Error: Check your Django CORS settings.');
        } else {
          setError('Failed to load products');
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-mintGreen p-6">
        <p className="text-green-700 text-lg font-semibold">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-mintGreen p-6">
        <div className="text-center">
          <p className="text-red-700 text-lg font-semibold mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mintGreen">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-black text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-center w-full sm:w-auto sm:text-left">
            SHREYANSI'S MART
          </h1>
          <div className="hidden sm:block">
            <Button
              onClick={() => router.push('/login')} // ✅ Navigate on click
              className="bg-green-600 hover:bg-green-700 text-white text-base font-semibold px-6 py-2 rounded-xl transition flex items-center gap-2"
            >
              <FaSignInAlt className="w-5 h-5" />
              Login
            </Button>
          </div>
        </div>

        {/* Mobile login button */}
        <div className="block sm:hidden text-center pb-2">
          <Button
            onClick={() => router.push('/login')} // ✅ Navigate on click
            className="bg-yellow-500 hover:bg-yellow-400 text-white text-base font-semibold px-6 py-2 rounded-xl transition flex items-center gap-2"
          >
            <FaSignInAlt className="w-5 h-5" />
            Login
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="shadow-lg hover:shadow-2xl transition-shadow rounded-xl border border-green-200"
            >
              {/* Product Image */}
              {product.image && (
                <div className="flex justify-center px-6 mx-4 mt-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-300">
                    <Image
                      src={
                        product.image.startsWith('http')
                          ? product.image
                          : `http://localhost:8000${product.image}`
                      }
                      alt={product.name}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              {/* Product Info */}
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-green-900 flex items-center gap-2">
                  <FaShoppingBag className="w-6 h-6 text-green-500" />
                  {product.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-green-800 font-semibold mb-2">Rs. {product.price}</p>
                <p
                  className={`text-sm font-medium ${
                    product.current_stock > 0 ? 'text-green-700' : 'text-red-600'
                  }`}
                >
                  Stock: {product.current_stock}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}



// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { FaShoppingBag, FaSignInAlt } from 'react-icons/fa';

// interface Product {
//   id: number;
//   name: string;
//   price: string;
//   current_stock: number;
//   image: string; // still in interface in case needed later
// }

// export default function HomePage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     axios
//       .get<Product[]>('http://localhost:8000/api/browse/products/')
//       .then((res) => setProducts(res.data))
//       .catch((err) => {
//         console.error('Error fetching products:', err.message || err);
//         setError('Failed to load products');
//       });
//   }, []);

//   if (error) {
//     return (
//       <main className="min-h-screen flex items-center justify-center bg-mintGreen p-6">
//         <p className="text-red-700 text-lg font-semibold">{error}</p>
//       </main>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-mintGreen p-8">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
//           <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center w-full sm:w-auto gap-3">
//             <FaShoppingBag className="w-10 h-10 text-green-600" />
//             E-COMMERCE SHOP
//           </h1>
//           <Button
//             variant="outline"
//             className="text-lg px-6 py-3 rounded-xl flex items-center gap-2 border-green-700 text-green-700 hover:bg-green-100 transition"
//           >
//             <FaSignInAlt className="w-5 h-5" />
//             Login
//           </Button>
//         </div>

//         {/* Product Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
//           {products.map((product) => (
//             <Card
//               key={product.id}
//               className="shadow-lg hover:shadow-2xl transition-shadow rounded-xl border border-green-200"
//             >
//               <CardHeader>
//                 <CardTitle className="text-2xl font-semibold text-green-900 flex items-center gap-2">
//                   <FaShoppingBag className="w-6 h-6 text-green-500" />
//                   {product.name}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-lg text-green-800 font-semibold mb-2">Rs. {product.price}</p>
//                 <p
//                   className={`text-sm font-medium ${
//                     product.current_stock > 0 ? 'text-green-700' : 'text-red-600'
//                   }`}
//                 >
//                   Stock: {product.current_stock}
//                 </p>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </main>
//   );
// }
