

from rest_framework.routers import DefaultRouter
from .views import AuthorViewSet, CategoryViewSet, PostViewSet

router = DefaultRouter()
router.register(r'authors', AuthorViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'posts', PostViewSet)

urlpatterns = router.urls
