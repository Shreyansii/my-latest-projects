import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export default function CartDrawer({ open, onOpenChange }) {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, totalPrice, totalCount, clearCart } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="rounded-2xl px-10 py-8">
        <SheetHeader>
          <SheetTitle>Your Cart ({totalCount} items)</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-4 px-10 py-12">
          {cartItems.length === 0 && <p>Your cart is empty.</p>}
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <h4 className="font-bold">{item.name}</h4>
                <p>Quantity: {item.quantity}</p>
                <div className="flex gap-2 mt-1">
                  <Button size="sm" onClick={() => increaseQuantity(item.id)}>+</Button>
                  <Button size="sm" onClick={() => decreaseQuantity(item.id)}>-</Button>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-right">${item.price * item.quantity}</p>
                <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        {cartItems.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <Button className="w-full mt-2" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
