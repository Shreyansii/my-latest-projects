
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function ProductCard({ product, onAddToCart }) {
  return (
    <Card className="w-64 m-2">
      <CardHeader className="text-lg font-bold">{product.name}</CardHeader>
      <CardContent>
        <p className="mb-2 text-gray-600">{product.price}</p>
        <Button onClick={() => onAddToCart(product)}>Add to Cart</Button>
      </CardContent>
    </Card>
  );
}
