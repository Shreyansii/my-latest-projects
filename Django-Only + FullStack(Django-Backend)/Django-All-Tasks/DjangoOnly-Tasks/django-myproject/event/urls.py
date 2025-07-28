from django.urls import path
from . import views

urlpatterns = [
    path('events/', views.EventListView.as_view(), name='event-list'),
    path('events/add/', views.EventCreateView.as_view(), name='event-add'),
    path('events/<int:pk>/edit/', views.EventUpdateView.as_view(), name='event-edit'),
    path('events/<int:pk>/delete/', views.EventDeleteView.as_view(), name='event-delete'),

    path('attendee/add/', views.attendee_create, name='attendee-add'),
    path('register/', views.registration_create, name='registration-add'),
]
