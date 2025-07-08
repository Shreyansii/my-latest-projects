from django import forms
from .models import Event, Registration, Attendee
from django.forms import ModelForm, Select, TextInput, DateTimeInput

class EventForm(ModelForm):
    class Meta:
        model = Event
        fields = '__all__'
        widgets = {
            'title': TextInput(attrs={'class': 'form-input rounded-md border-gray-300'}),
            'description': forms.Textarea(attrs={'class': 'form-textarea mt-1 block w-full'}),
            'venue': Select(attrs={'class': 'form-select rounded-md'}),
            'organizer': Select(attrs={'class': 'form-select rounded-md'}),
            'start_time': DateTimeInput(attrs={'type': 'datetime-local', 'class': 'form-input'}),
            'end_time': DateTimeInput(attrs={'type': 'datetime-local', 'class': 'form-input'}),
        }

class RegistrationForm(ModelForm):
    class Meta:
        model = Registration
        fields = ['event', 'attendee', 'status']
        widgets = {
            'event': Select(attrs={'class': 'form-select'}),
            'attendee': Select(attrs={'class': 'form-select'}),
            'status': Select(attrs={'class': 'form-select'}),
        }

class AttendeeForm(ModelForm):
    class Meta:
        model = Attendee
        fields = '__all__'
        widgets = {
            'name': TextInput(attrs={'class': 'form-input'}),
            'email': TextInput(attrs={'class': 'form-input'}),
            'phone': TextInput(attrs={'class': 'form-input'}),
        }
