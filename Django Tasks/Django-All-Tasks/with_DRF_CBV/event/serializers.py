from rest_framework import serializers
from .models import Venue, Organizer, Event, Attendee, Registration

class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = '__all__'

class OrganizerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizer
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)
    organizer = OrganizerSerializer(read_only=True)
    venue_id = serializers.PrimaryKeyRelatedField(queryset=Venue.objects.all(), source='venue', write_only=True)
    organizer_id = serializers.PrimaryKeyRelatedField(queryset=Organizer.objects.all(), source='organizer', write_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description',
            'venue', 'venue_id',
            'organizer', 'organizer_id',
            'start_time', 'end_time'
        ]

class AttendeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendee
        fields = '__all__'

class RegistrationSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)
    attendee = AttendeeSerializer(read_only=True)
    event_id = serializers.PrimaryKeyRelatedField(queryset=Event.objects.all(), source='event', write_only=True)
    attendee_id = serializers.PrimaryKeyRelatedField(queryset=Attendee.objects.all(), source='attendee', write_only=True)

    class Meta:
        model = Registration
        fields = [
            'id', 'event', 'event_id',
            'attendee', 'attendee_id',
            'registration_date', 'status'
        ]
