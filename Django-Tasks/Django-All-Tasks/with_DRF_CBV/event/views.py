from rest_framework import viewsets
from .models import Venue, Organizer, Event, Attendee, Registration
from .serializers import (
    VenueSerializer, OrganizerSerializer, EventSerializer,
    AttendeeSerializer, RegistrationSerializer
)
from .permissions import IsAdminOrReadOnly

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [IsAdminOrReadOnly]

class OrganizerViewSet(viewsets.ModelViewSet):
    queryset = Organizer.objects.all()
    serializer_class = OrganizerSerializer
    permission_classes = [IsAdminOrReadOnly]

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related('venue', 'organizer').all()
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]

class AttendeeViewSet(viewsets.ModelViewSet):
    queryset = Attendee.objects.all()
    serializer_class = AttendeeSerializer
    permission_classes = [IsAdminOrReadOnly]

class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.select_related('event', 'attendee').all()
    serializer_class = RegistrationSerializer
    permission_classes = [IsAdminOrReadOnly]
