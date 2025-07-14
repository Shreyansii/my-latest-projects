from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, CourseViewSet, StudentViewSet, EnrollmentViewSet

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'students', StudentViewSet)
router.register(r'enrollments', EnrollmentViewSet)

urlpatterns = router.urls
