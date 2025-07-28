
from rest_framework import generics, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from django.db import transaction
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView 

from rest_framework.views import APIView 
from django.db.models import Count
from django.core.exceptions import ValidationError


from .serializers import (
    UserRegistrationSerializer,
    CategorySerializer,
    ProductSerializer,
    OrderSerializer,
    DashboardSummarySerializer,
      CustomTokenObtainPairSerializer, UserListSerializer, UserManagementSerializer
)
from .models import User, Category, Product, Order
from .permissions import IsAdminUser, IsAdminOrReadOnly, IsCustomer, IsOwnerOrAdmin


# ---- User Registration ------
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    authentication_classes = []  # No auth needed to register
    permission_classes = [AllowAny]


# ---------- Admin: Category & Product Management ---
class CategoryViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminOrReadOnly]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminOrReadOnly]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})  #  Needed for absolute image URLs
        return context

    @action(detail=False, methods=['get'], url_path='inactive')
    def inactive(self, request):
        inactive_products = Product.objects.filter(status='inactive')
        serializer = self.get_serializer(inactive_products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_stock(self, request, pk=None):
        product = self.get_object()
        quantity = int(request.data.get('quantity', 0))

        if quantity <= 0:
            return Response({'error': 'Quantity must be positive'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            product.current_stock += quantity
            product.save()

        return Response({'message': f'Added {quantity} units to stock'})

    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        product = self.get_object()
        new_stock = request.data.get('new_stock')

        try:
            new_stock = int(new_stock)
            if new_stock < 0:
                raise ValueError
        except (TypeError, ValueError):
            return Response({'error': 'New stock must be a non-negative integer'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            old_stock = product.current_stock
            product.current_stock = new_stock
            product.save()

        return Response({'message': f'Stock adjusted from {old_stock} to {new_stock}'})


# --------- Public: Customer Access (No Auth Required) ------------
class PublicCategoryList(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    authentication_classes = []
    permission_classes = [AllowAny]


class ActiveProductList(generics.ListAPIView):
    queryset = Product.objects.filter(status='active')
    serializer_class = ProductSerializer
    authentication_classes = []
    permission_classes = [AllowAny]


# ------- Customer: Order Management --------------------
class CustomerOrderViewSet(viewsets.ModelViewSet):
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
class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        order = self.get_object()

        if order.status != 'PENDING':
            return Response({'error': 'Order is not pending'},
                             status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                for item in order.items.all():
                    item.product.fulfill_order(item.quantity)

                order.status = 'CONFIRMED'
                order.save()

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'message': 'Order confirmed and stock updated'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()

        if order.status not in ['PENDING', 'CONFIRMED']:
            return Response({'error': 'Order cannot be cancelled'},
                             status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            for item in order.items.all():
                item.product.release_reserved_stock(item.quantity)

            order.status = 'CANCELLED'
            order.save()

        return Response({'message': 'Order cancelled and stock released'})



# class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [IsAdminUser]
#     queryset = Order.objects.all().select_related('customer').prefetch_related('items')
    
#     def get_serializer_class(self):
#         if self.action == 'list':
#             # Use simplified serializer for list view (better performance)
#             return OrderListSerializer
#         return OrderSerializer  # Use detailed serializer for individual orders

#     @action(detail=True, methods=['post'])
#     def confirm(self, request, pk=None):
#         order = self.get_object()

#         if order.status != 'pending':  # Fixed: was 'PENDING'
#             return Response({'error': 'Order is not pending'},
#                              status=status.HTTP_400_BAD_REQUEST)

#         try:
#             with transaction.atomic():
#                 for item in order.items.all():
#                     item.product.fulfill_order(item.quantity)

#                 order.status = 'confirmed'  # Fixed: was 'CONFIRMED'
#                 order.save()

#         except ValidationError as e:
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

#         return Response({'message': 'Order confirmed and stock updated'})

#     @action(detail=True, methods=['post'])
#     def cancel(self, request, pk=None):
#         order = self.get_object()

#         if order.status not in ['pending', 'confirmed']:  # Fixed: was uppercase
#             return Response({'error': 'Order cannot be cancelled'},
#                              status=status.HTTP_400_BAD_REQUEST)

#         with transaction.atomic():
#             for item in order.items.all():
#                 item.product.release_reserved_stock(item.quantity)

#             order.status = 'cancelled'  # Fixed: was 'CANCELLED'
#             order.save()

#         return Response({'message': 'Order cancelled and stock released'})
# # class ProductReviewList(generics.ListAPIView):
#     """
#     List product reviews with optional authentication.
#     - Everyone can see reviews
#     - Authenticated users see if they can edit/delete their own reviews
#     """
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [AllowAny]
    
#     def list(self, request, *args, **kwargs):
#         reviews = ProductReview.objects.filter(product_id=self.kwargs['pk'])
        
#         # Everyone can see reviews
#         serializer = self.get_serializer(reviews, many=True)
#         data = serializer.data
        
#         # But authenticated users see if they can edit/delete
#         if request.user.is_authenticated:
#             for review_data in data:
#                 review_data['can_edit'] = (
#                     review_data['author'] == request.user.id
#                 )
        
#         return Response(data)







# --- NEW: Dashboard Summary View ---
class DashboardSummaryView(APIView):
    authentication_classes = [JWTAuthentication] # Requires a valid JWT
    permission_classes = [IsAdminUser]           # Only 'admin' or 'superadmin' users can see this

    @extend_schema(responses=DashboardSummarySerializer)
    def get(self, request):
        total_users = User.objects.count()
        total_products = Product.objects.count()
       
        pending_orders = Order.objects.filter(status='pending').count()

        summary_data = {
            'total_users': total_users,
            'total_products': total_products,
            'pending_orders': pending_orders,
        }
        return Response(summary_data)



# newwwwwwwwwwww

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT view that uses our serializer to include user role in token response.
    """
    serializer_class = CustomTokenObtainPairSerializer


    # newww

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "role": user.role,
        })
    
    #added

class AdminUserViewSet(viewsets.ModelViewSet):
    """Admin-only user management"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserManagementSerializer
    
    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        return queryset
    
    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle user active status"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        
        serializer = self.get_serializer(user)
        return Response({
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'user': serializer.data
        })