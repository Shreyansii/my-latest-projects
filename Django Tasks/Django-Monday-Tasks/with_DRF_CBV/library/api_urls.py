from rest_framework.routers import DefaultRouter
from .views import AuthorViewSet, PublisherViewSet, BookViewSet, MemberViewSet, BorrowingViewSet

router = DefaultRouter()
router.register(r'authors', AuthorViewSet)
router.register(r'publishers', PublisherViewSet)
router.register(r'books', BookViewSet)
router.register(r'members', MemberViewSet)
router.register(r'borrowings', BorrowingViewSet)

urlpatterns = router.urls
