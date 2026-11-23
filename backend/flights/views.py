
from django.utils.dateparse import parse_date
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import Flight
from .serializers import FlightSerializer, FlightStatusSerializer
from accounts.views import IsAirBookingAdmin


# Customer: Search and list flights
class FlightSearchView(generics.ListAPIView):
    serializer_class = FlightSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Flight.objects.all()

        # Filter by departure airport
        departure = self.request.query_params.get('departure_airport')
        if departure:
            queryset = queryset.filter(
                departure_airport__iexact=departure.strip()
            )

        # Filter by arrival airport
        arrival = self.request.query_params.get('arrival_airport')
        if arrival:
            queryset = queryset.filter(
                arrival_airport__iexact=arrival.strip()
            )

        # Filter by departure date
        date = self.request.query_params.get('date')
        if date:
            parsed_date = parse_date(date)

            if parsed_date is None:
                raise ValidationError({
                    'date': 'Enter a valid date in YYYY-MM-DD format.'
                })

            queryset = queryset.filter(
                departure_time__date=parsed_date
            )

        # Filter by seat availability
        available = self.request.query_params.get('available')
        if available == 'true':
            queryset = queryset.filter(available_seats__gt=0)
        elif available == 'false':
            queryset = queryset.filter(available_seats=0)

        return queryset


# Customer: View details of one flight
class FlightDetailView(generics.RetrieveAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [IsAuthenticated]


# Admin: List and create flights
class AdminFlightListCreateView(generics.ListCreateAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [IsAirBookingAdmin]


# Admin: View, update or delete a flight
class AdminFlightDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [IsAirBookingAdmin]


# Admin: Update only the flight status
class FlightStatusUpdateView(generics.UpdateAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightStatusSerializer
    permission_classes = [IsAirBookingAdmin]
    http_method_names = ['put']
