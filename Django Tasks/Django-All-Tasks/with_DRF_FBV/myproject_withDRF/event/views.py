from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *

# VENUE 

@api_view(['GET', 'POST'])
def venue_list_create(request):
    if request.method == 'GET':
        venues = Venue.objects.all()
        serializer = VenueSerializer(venues, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = VenueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def venue_detail(request, pk):
    try:
        venue = Venue.objects.get(pk=pk)
    except Venue.DoesNotExist:
        return Response({'error': 'Venue not found'}, status=404)

    if request.method == 'GET':
        serializer = VenueSerializer(venue)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = VenueSerializer(venue, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        venue.delete()
        return Response(status=204)

#  ORGANIZER 

@api_view(['GET', 'POST'])
def organizer_list_create(request):
    if request.method == 'GET':
        organizers = Organizer.objects.all()
        serializer = OrganizerSerializer(organizers, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = OrganizerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def organizer_detail(request, pk):
    try:
        organizer = Organizer.objects.get(pk=pk)
    except Organizer.DoesNotExist:
        return Response({'error': 'Organizer not found'}, status=404)

    if request.method == 'GET':
        serializer = OrganizerSerializer(organizer)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = OrganizerSerializer(organizer, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        organizer.delete()
        return Response(status=204)

#  EVENT 

@api_view(['GET', 'POST'])
def event_list_create(request):
    if request.method == 'GET':
        events = Event.objects.all()
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def event_detail(request, pk):
    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=404)

    if request.method == 'GET':
        serializer = EventSerializer(event)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = EventSerializer(event, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        event.delete()
        return Response(status=204)

#  ATTENDEE 

@api_view(['GET', 'POST'])
def attendee_list_create(request):
    if request.method == 'GET':
        attendees = Attendee.objects.all()
        serializer = AttendeeSerializer(attendees, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = AttendeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def attendee_detail(request, pk):
    try:
        attendee = Attendee.objects.get(pk=pk)
    except Attendee.DoesNotExist:
        return Response({'error': 'Attendee not found'}, status=404)

    if request.method == 'GET':
        serializer = AttendeeSerializer(attendee)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = AttendeeSerializer(attendee, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        attendee.delete()
        return Response(status=204)

#  REGISTRATION 

@api_view(['GET', 'POST'])
def registration_list_create(request):
    if request.method == 'GET':
        registrations = Registration.objects.all()
        serializer = RegistrationSerializer(registrations, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def registration_detail(request, pk):
    try:
        registration = Registration.objects.get(pk=pk)
    except Registration.DoesNotExist:
        return Response({'error': 'Registration not found'}, status=404)

    if request.method == 'GET':
        serializer = RegistrationSerializer(registration)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = RegistrationSerializer(registration, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == 'DELETE':
        registration.delete()
        return Response(status=204)
