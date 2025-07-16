from rest_framework import serializers
from .models import User,Category, Product, Order, OrderItem
from django.contrib.auth.password_validation import validate_password



# for userr
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

#for product related stuffs

from .models import Category, Product, Order

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'



class ProductSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'status', 'display_name']

    def get_display_name(self, obj):
        if obj.status == 'inactive':
            return "Inactive"
        return obj.name


# class OrderSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Order
#         fields = '__all__'
#         read_only_fields = ['customer', 'status']



class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)  # uses related_name="items" from model

    class Meta:
        model = Order
        fields = ['id', 'customer', 'status', 'created_at', 'items']
        read_only_fields = ['customer', 'status']
