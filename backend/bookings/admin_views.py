
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Booking
from .serializers import BookingSerializer
from accounts.views import IsAirBookingAdmin


# Admin: View all bookings
class AdminBookingListView(generics.ListAPIView):

    serializer_class = BookingSerializer
    permission_classes = [IsAirBookingAdmin]

    def get_queryset(self):
        queryset = Booking.objects.select_related(
            'user', 'flight'
        ).all()

        # Filter by booking status
        booking_status = self.request.query_params.get(
            'booking_status'
        )

        if booking_status:
            queryset = queryset.filter(
                booking_status=booking_status
            )

        # Filter by payment status
        payment_status = self.request.query_params.get(
            'payment_status'
        )

        if payment_status:
            queryset = queryset.filter(
                payment_status=payment_status
            )

        return queryset


# Admin: View individual booking
class AdminBookingDetailView(generics.RetrieveAPIView):

    queryset = Booking.objects.select_related(
        'user', 'flight'
    ).all()

    serializer_class = BookingSerializer
    permission_classes = [IsAirBookingAdmin]
