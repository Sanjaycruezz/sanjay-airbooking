
from django.db import models
from django.db.models import Q


class Flight(models.Model):

    class FlightStatus(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        ON_TIME = 'on_time', 'On Time'
        DELAYED = 'delayed', 'Delayed'
        CANCELLED = 'cancelled', 'Cancelled'
        DEPARTED = 'departed', 'Departed'
        LANDED = 'landed', 'Landed'

    flight_number = models.CharField(max_length=20)

    airline = models.CharField(max_length=100)

    departure_airport = models.CharField(max_length=3)
    arrival_airport = models.CharField(max_length=3)

    departure_city = models.CharField(max_length=100)
    arrival_city = models.CharField(max_length=100)

    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    total_seats = models.PositiveIntegerField()
    available_seats = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=FlightStatus.choices,
        default=FlightStatus.SCHEDULED
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['departure_time']

        constraints = [
            models.UniqueConstraint(
                fields=['flight_number', 'departure_time'],
                name='unique_flight_departure'
            ),
            models.CheckConstraint(
                condition=Q(price__gte=0),
                name='flight_price_nonnegative'
            ),
            models.CheckConstraint(
                condition=Q(available_seats__lte=models.F('total_seats')),
                name='available_seats_not_above_total'
            ),
        ]

    def __str__(self):
        return f"{self.flight_number} - {self.departure_airport} to {self.arrival_airport}"
