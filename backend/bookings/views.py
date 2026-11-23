
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError

from flights.models import Flight
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Booking
from .serializers import BookingSerializer


# Customer: Create a new booking
class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]


# Customer: View their own bookings
class MyBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        )


# Customer: View details of a particular booking
class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        )


class BookingCancelView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        with transaction.atomic():

            # Find and lock the customer's booking
            booking = Booking.objects.select_for_update().filter(
                id=pk,
                user=request.user
            ).first()

            if booking is None:
                raise NotFound("Booking not found.")

            # Prevent duplicate cancellation
            if booking.booking_status == Booking.BookingStatus.CANCELLED:
                raise ValidationError(
                    "This booking is already cancelled."
                )

            # Lock the associated flight
            flight = Flight.objects.select_for_update().get(
                id=booking.flight_id
            )

            # Prevent cancellation after departure
            if (
                flight.status in [
                    Flight.FlightStatus.DEPARTED,
                    Flight.FlightStatus.LANDED,
                ]
                or flight.departure_time <= timezone.now()
            ):
                raise ValidationError(
                    "This booking cannot be cancelled after departure."
                )

            # Restore the reserved seats
            flight.available_seats += booking.number_of_seats
            flight.save(update_fields=['available_seats'])

            # Cancel the booking
            booking.booking_status = Booking.BookingStatus.CANCELLED
            booking.save(update_fields=['booking_status', 'updated_at'])

        return Response(
            {
                'message': 'Booking cancelled successfully.',
                'booking': BookingSerializer(booking).data,
            },
            status=status.HTTP_200_OK
        )
