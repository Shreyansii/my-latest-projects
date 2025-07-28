from django.db import models

class Venue(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    capacity = models.PositiveIntegerField()
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class Organizer(models.Model):
    name = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)

    def __str__(self):
        return self.name

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True)
    organizer = models.ForeignKey(Organizer, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return self.title

class Attendee(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)

    def __str__(self):
        return self.name

class Registration(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    attendee = models.ForeignKey(Attendee, on_delete=models.CASCADE)
    registration_date = models.DateField()
    status = models.CharField(max_length=20, choices=[("confirmed", "Confirmed"), ("cancelled", "Cancelled")])

    def __str__(self):
        return f"{self.attendee.name} - {self.event.title}"
