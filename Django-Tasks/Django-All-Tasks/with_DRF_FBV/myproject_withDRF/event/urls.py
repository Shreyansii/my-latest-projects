from django.urls import path
from . import views

urlpatterns = [
    path('venues/', views.venue_list_create),
    path('venues/<int:pk>/', views.venue_detail),

    path('organizers/', views.organizer_list_create),
    path('organizers/<int:pk>/', views.organizer_detail),

    path('events/', views.event_list_create),
    path('events/<int:pk>/', views.event_detail),

    path('attendees/', views.attendee_list_create),
    path('attendees/<int:pk>/', views.attendee_detail),

    path('registrations/', views.registration_list_create),
    path('registrations/<int:pk>/', views.registration_detail),
]
