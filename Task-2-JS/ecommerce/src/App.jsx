import { useState } from "react";
import ProductList from "@/pages/ProductList";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider, useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";


function AppContent() {
  const [cartOpen, setCartOpen] = useState(false);
  const { totalCount } = useCart();

  return (
    <div className="min-h-screen bg-gray-70">
      <header className="bg-black shadow flex justify-between items-center p-5">
        <h1 className="text-3xl font-bold text-teal-400">Shreyansi's E-Commerce Store</h1>
        <Button onClick={() => setCartOpen(true)}>
           <ShoppingCart className="w-5 h-5" />
          Cart ({totalCount})
        </Button>
      </header>

      <ProductList />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
