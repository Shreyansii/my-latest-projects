from rest_framework.routers import DefaultRouter
from .views import BrandViewSet, CategoryViewSet, ProductViewSet

router = DefaultRouter()
router.register(r'brands', BrandViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)

urlpatterns = router.urls
