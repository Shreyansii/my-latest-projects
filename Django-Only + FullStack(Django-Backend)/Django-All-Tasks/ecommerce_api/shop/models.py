from django.contrib.auth.models import AbstractUser
from django.db import models, transaction
from django.core.exceptions import ValidationError

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('customer', 'Customer'),
         ('superadmin', 'SuperAdmin'),

    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')

    def __str__(self):
        return self.username

class Category(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )
    
    # Basic product information
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    
    # Stock management fields - FIXED LOGIC
    stock_quantity = models.PositiveIntegerField(default=100)  # Total inventory
    reserved_stock = models.PositiveIntegerField(default=0)    # Stock reserved for pending orders
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def current_stock(self):
        """Current available stock = Total stock - Reserved stock"""
        return self.stock_quantity - self.reserved_stock

    @property
    def available_stock(self):
        """Same as current_stock - stock available for new orders"""
        return self.current_stock

    def can_fulfill_order(self, quantity):
        """Check if we can fulfill an order for given quantity"""
        return self.available_stock >= quantity

    def reserve_stock(self, quantity):
        """Reserve stock for pending order"""
        if not self.can_fulfill_order(quantity):
            raise ValidationError(f"Insufficient stock. Available: {self.available_stock}, Required: {quantity}")
        
        with transaction.atomic():
            # Refresh from database to avoid race conditions
            product = Product.objects.select_for_update().get(id=self.id)
            if product.available_stock < quantity:
                raise ValidationError(f"Insufficient stock. Available: {product.available_stock}, Required: {quantity}")
            
            product.reserved_stock += quantity
            product.save()
            # Update self instance
            self.reserved_stock = product.reserved_stock
        return True

    def release_reserved_stock(self, quantity):
        """Release reserved stock (e.g., when order is cancelled)"""
        with transaction.atomic():
            product = Product.objects.select_for_update().get(id=self.id)
            product.reserved_stock = max(0, product.reserved_stock - quantity)
            product.save()
            # Update self instance
            self.reserved_stock = product.reserved_stock

    def fulfill_order(self, quantity):
        """Fulfill order by reducing total stock and reserved stock"""
        with transaction.atomic():
            product = Product.objects.select_for_update().get(id=self.id)
            if product.reserved_stock < quantity:
                raise ValidationError("Not enough reserved stock to fulfill order")
            
            # When order is fulfilled, reduce both total stock and reserved stock
            product.stock_quantity -= quantity
            product.reserved_stock -= quantity
            product.save()
            
            # Update self instance
            self.stock_quantity = product.stock_quantity
            self.reserved_stock = product.reserved_stock

# class ProductReview(models.Model):
#     product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
#     author = models.ForeignKey(User, on_delete=models.CASCADE)
#     rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
#     comment = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         unique_together = ['product', 'author']

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} by {self.customer.username}"

    def calculate_total(self):
        """Calculate and update total amount"""
        total = sum(item.total_price for item in self.items.all())
        self.total_amount = total
        self.save()
        return total

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} (Order #{self.order.id})"
    
    @property
    def total_price(self):
        return self.quantity * self.price

    def save(self, *args, **kwargs):
        # Set price from product if not provided
        if not self.price:
            self.price = self.product.price
        super().save(*args, **kwargs)
