
'use client';

import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaShoppingBag, FaSignInAlt, FaShoppingCart } from 'react-icons/fa';
import { text } from 'stream/consumers';

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
  const router = useRouter();

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

  const handleAddToCart = (productId: number) => {
    // Redirect to login page when add to cart is clicked
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-mintpurple p-6">
        <p className="text-purple-700 text-lg font-semibold">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-mintpurple p-6">
        <div className="text-center">
          <p className="text-red-700 text-lg font-semibold mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mintpurple">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-black text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-center w-full sm:w-auto sm:text-left">
            THE MART
          </h1>
          <div className="hidden sm:flex items-center gap-4">
            <Button
              onClick={() => router.push('/login')}
              className="bg-yellow-300 hover:bg-yellow-600 text-black text-base font-semibold px-6 py-2 rounded-m transition flex items-center gap-2"
            >
              <FaShoppingCart className="w-5 h-5" />
              Cart
            </Button>
            <Button
              onClick={() => router.push('/login')} 
              className="bg-purple-600 hover:bg-purple-700 text-white text-base font-semibold px-6 py-2 rounded-m transition flex items-center gap-2"
            >
              <FaSignInAlt className="w-5 h-5" />
              Login
            </Button>
          </div>
        </div>

        {/* Mobile buttons */}
        <div className="flex sm:hidden justify-center gap-4 pb-2">
          <Button
            onClick={() => router.push('/login')}
            className="bg-orange-600 hover:bg-orange-700 text-white text-base font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2"
          >
            <FaShoppingCart className="w-4 h-4" />
            Cart
          </Button>
          <Button
            onClick={() => router.push('/login')}
            className="bg-yellow-500 hover:bg-yellow-400 text-white text-base font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2"
          >
            <FaSignInAlt className="w-4 h-4" />
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
              className="shadow-lg hover:shadow-2xl transition-shadow rounded-xl border border-purple-200"
            >
              {/* Product Image */}
              {product.image && (
                <div className="flex justify-center px-6 mx-4 mt-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-300">
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
                <CardTitle className="text-2xl font-semibold text-purple-900 flex items-center gap-2">
                  <FaShoppingBag className="w-6 h-6 text-purple-500" />
                  {product.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-purple-800 font-semibold mb-2">Rs. {product.price}</p>
                <p
                  className={`text-sm font-medium mb-4 ${
                    product.current_stock > 0 ? 'text-purple-700' : 'text-red-600'
                  }`}
                >
                  Stock: {product.current_stock}
                </p>
                
                {/* Add to Cart Button */}
                <Button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.current_stock === 0}
                  className={`w-full font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
                    product.current_stock > 0
                      ? 'bg-yellow-500 hover:bg-purple-500 text-black hover:text-black'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <FaShoppingCart className="w-4 h-4" />
                  {product.current_stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
