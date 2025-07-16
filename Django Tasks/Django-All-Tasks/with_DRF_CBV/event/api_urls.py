from rest_framework.routers import DefaultRouter
from .views import (
    VenueViewSet, OrganizerViewSet, EventViewSet,
    AttendeeViewSet, RegistrationViewSet
)

router = DefaultRouter()
router.register(r'venues', VenueViewSet)
router.register(r'organizers', OrganizerViewSet)
router.register(r'events', EventViewSet)
router.register(r'attendees', AttendeeViewSet)
router.register(r'registrations', RegistrationViewSet)

urlpatterns = router.urls
