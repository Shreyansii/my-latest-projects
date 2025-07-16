from rest_framework import generics, viewsets
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .serializers import (
    UserRegistrationSerializer,
    CategorySerializer,
    ProductSerializer,
    OrderSerializer
)
from .models import User, Category, Product, Order
from .permissions import IsAdminOrReadOnly, IsCustomer, IsOwnerOrAdmin


# ---- User Registration ------
class RegisterView(generics.CreateAPIView):
    """
    Register a new user.

    Accepts user details (username, password, etc.) and creates a new account.
    No authentication required.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    authentication_classes = []  # No auth needed to register
    permission_classes = []


# ---------- Admin: Category & Product Management ---
class CategoryViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset for managing product categories.

    Supports create, list, retrieve, update, and delete.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset for managing products.

    Supports create, list, retrieve, update, delete.
    Includes a custom endpoint for listing inactive products.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=False, methods=['get'], url_path='inactive')
    def inactive(self, request):
        """
        List all inactive products.
        """
        inactive_products = Product.objects.filter(status='inactive')
        serializer = self.get_serializer(inactive_products, many=True)
        return Response(serializer.data)


# --------- Public: Customer Access (No Auth Required) ------------
class PublicCategoryList(generics.ListAPIView):
    """
    Public endpoint: List all categories.

    No authentication required.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    authentication_classes = []
    permission_classes = []


class ActiveProductList(generics.ListAPIView):
    """
    Public endpoint: List all active products.

    No authentication required.
    """
    queryset = Product.objects.filter(status='active')
    serializer_class = ProductSerializer
    authentication_classes = []
    permission_classes = []


# ------- Customer: Order Management --------------------
class CustomerOrderViewSet(viewsets.ModelViewSet):
    """
    Customers can view and create their own orders.

    - Only sees their own orders.
    - Can delete an order only if its status is 'pending'.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsCustomer, IsOwnerOrAdmin]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    def perform_destroy(self, instance):
        if instance.status == 'pending':
            instance.delete()


# ------- Admin: Order Management --------------------
class AdminOrderViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset for managing all customer orders.

    Full CRUD access.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
