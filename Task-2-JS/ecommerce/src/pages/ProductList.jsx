import { products } from "@/data/products";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export default function ProductList() {
  const { addToCart } = useCart();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {products.map((product) => (
        <Card key={product.id}>
          <CardContent className="flex flex-col items-center">
            <img src={product.image} alt={product.name} className="mb-2" />
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p className="text-gray-700">${product.price}</p>
            <Button
              className="mt-2"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
