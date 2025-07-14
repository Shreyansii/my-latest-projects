from rest_framework import viewsets
from .models import Brand, Category, Product
from .serializers import BrandSerializer, CategorySerializer, ProductSerializer
from .permissions import IsAdminOrReadOnly

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('brand', 'category').all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
