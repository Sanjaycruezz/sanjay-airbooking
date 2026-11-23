
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError

from .models import Booking
from .serializers import BookingSerializer
from flights.models import Flight


class SimulatedPaymentView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        # Accept only a boolean payment result
        payment_success = request.data.get('payment_success')

        if not isinstance(payment_success, bool):
            raise ValidationError({
                'payment_success':
                    'Provide true or false for payment_success.'
            })

        with transaction.atomic():

            # Lock the booking and ensure it belongs to this customer
            booking = Booking.objects.select_for_update().filter(
                id=pk,
                user=request.user
            ).first()

            if booking is None:
                raise NotFound("Booking not found.")

            # Prevent processing the same booking payment twice
            if booking.payment_status != Booking.PaymentStatus.PENDING:
                raise ValidationError(
                    "Payment has already been processed."
                )

            if booking.booking_status != Booking.BookingStatus.PENDING:
                raise ValidationError(
                    "This booking cannot be paid for."
                )

            if payment_success:

                # Payment successful
                booking.payment_status = Booking.PaymentStatus.SUCCESS
                booking.booking_status = Booking.BookingStatus.CONFIRMED

                message = "Payment successful. Booking confirmed."

            else:

                # Lock the flight before restoring seats
                flight = Flight.objects.select_for_update().get(
                    id=booking.flight_id
                )

                # Restore the seats
                flight.available_seats += booking.number_of_seats
                flight.save(update_fields=['available_seats'])

                # Payment failed
                booking.payment_status = Booking.PaymentStatus.FAILED
                booking.booking_status = Booking.BookingStatus.CANCELLED

                message = "Payment failed. Booking cancelled and seats restored."

            booking.save(
                update_fields=[
                    'payment_status',
                    'booking_status',
                    'updated_at',
                ]
            )

        return Response(
            {
                'message': message,
                'booking': BookingSerializer(booking).data,
            },
            status=status.HTTP_200_OK
        )
