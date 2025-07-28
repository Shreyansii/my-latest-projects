from rest_framework import serializers
from .models import User, Category, Product, Order, OrderItem
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    # These will show the calculated values
    current_stock = serializers.ReadOnlyField()  # stock_quantity - reserved_stock
    available_stock = serializers.ReadOnlyField()  # Same as current_stock
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'status', 
            'category', 'category_name', 'stock_quantity', 
            'reserved_stock', 'current_stock', 'available_stock',
            'created_at', 'updated_at','image'
        ]
        read_only_fields = ['reserved_stock', 'current_stock', 'available_stock']

        # def get_image_url(self, obj):
        #     request = self.context.get('request')
        #     if obj.image and request:
        #         return request.build_absolute_uri(obj.image.url)
        #     return None

        def to_representation(self, instance):
         data = super().to_representation(instance)
         if instance.image:
            # This will give  the full URL path like /media/products/image.jpg
                  data['image'] = instance.image.url
         return data

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'total_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_name', 'status', 
            'total_amount', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['customer', 'total_amount', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Set customer from request
        validated_data['customer'] = self.context['request'].user
        
        # Create order
        order = Order.objects.create(**validated_data)
        
        total_amount = 0
        reserved_items = []  # Track for rollback if needed
        
        try:
            with transaction.atomic():
                for item_data in items_data:
                    product = item_data['product']
                    quantity = item_data['quantity']
                    
                    # Check and reserve stock
                    product.reserve_stock(quantity)
                    reserved_items.append((product, quantity))
                    
                    # Create order item
                    order_item = OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        price=product.price  # Use current product price
                    )
                    total_amount += order_item.total_price
                
                # Update order total
                order.total_amount = total_amount
                order.save()
                
        except (ValidationError, Exception) as e:
            # Rollback reserved stock if anything fails
            for product, quantity in reserved_items:
                product.release_reserved_stock(quantity)
            raise serializers.ValidationError(f"Order creation failed: {str(e)}")
        
        return order

# Simple serializer for order listing (without nested items)
class OrderListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_name', 'status', 
            'total_amount', 'items_count', 'created_at', 'updated_at'
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()


# Management commands for testing/seeding data

# Run this in Django shell to set up test data:
"""
from shop.models import Category, Product, User

# Create categories
electronics = Category.objects.get_or_create(name='Electronics')[0]
stationery = Category.objects.get_or_create(name='Stationery')[0]

# Create products with proper stock
Product.objects.get_or_create(
    name='Pen',
    defaults={
        'description': 'Blue ballpoint pen',
        'price': 280.00,
        'category': stationery,
        'stock_quantity': 100,
        'reserved_stock': 0
    }
)

Product.objects.get_or_create(
    name='Notebook',
    defaults={
        'description': 'A5 spiral notebook',
        'price': 200.00,
        'category': stationery,
        'stock_quantity': 150,
        'reserved_stock': 0
    }
)

print("Products created/updated with proper stock!")
"""




# --- NEW: Dashboard Summary Serializer ---
class DashboardSummarySerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_products = serializers.IntegerField()
    pending_orders = serializers.IntegerField()


# newwwwwwww - so that only admin can login to admin dashboard, and not allow customer




class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Customizes the JWT token response to include the user's role.
    """
    def validate(self, attrs):
        # Call the parent class's validate method to get tokens
        data = super().validate(attrs)

        # Add custom data to the response
        # The self.user attribute is set by the parent's validate method
        data['role'] = self.user.role 
       
        return data
    
    # added

class UserListSerializer(serializers.ModelSerializer):
    """Serializer for listing users (admin view)"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['date_joined', 'last_login']

class UserManagementSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating users by admin"""
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'password', 'date_joined', 'last_login']
        read_only_fields = ['date_joined', 'last_login']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance