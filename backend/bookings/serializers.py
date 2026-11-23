
from django.db import transaction
from rest_framework import serializers

from .models import Booking
from flights.models import Flight


class BookingSerializer(serializers.ModelSerializer):

    flight_number = serializers.CharField(
        source='flight.flight_number',
        read_only=True
    )

    departure_city = serializers.CharField(
        source='flight.departure_city',
        read_only=True
    )

    arrival_city = serializers.CharField(
        source='flight.arrival_city',
        read_only=True
    )

    departure_time = serializers.DateTimeField(
        source='flight.departure_time',
        read_only=True
    )

    arrival_time = serializers.DateTimeField(
        source='flight.arrival_time',
        read_only=True
    )

    class Meta:
        model = Booking
        fields = [
            'id',
            'booking_reference',
            'flight',
            'flight_number',
            'departure_city',
            'arrival_city',
            'departure_time',
            'arrival_time',
            'number_of_seats',
            'total_price',
            'booking_status',
            'payment_status',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'booking_reference',
            'total_price',
            'booking_status',
            'payment_status',
            'created_at',
        ]

    def validate_number_of_seats(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Number of seats must be at least 1."
            )

        return value

    def validate(self, data):

        user = self.context['request'].user

        if user.approval_status != 'approved':
            raise serializers.ValidationError(
                "Your account is not approved for booking."
            )

        flight = data['flight']
        number_of_seats = data['number_of_seats']

        if flight.status == Flight.FlightStatus.CANCELLED:
            raise serializers.ValidationError(
                "This flight has been cancelled."
            )

        if flight.available_seats < number_of_seats:
            raise serializers.ValidationError(
                "Not enough seats available."
            )

        return data

    def create(self, validated_data):

        with transaction.atomic():

            # Lock the flight row to prevent simultaneous overbooking
            flight = Flight.objects.select_for_update().get(
                id=validated_data['flight'].id
            )

            number_of_seats = validated_data['number_of_seats']

            if flight.status == Flight.FlightStatus.CANCELLED:
                raise serializers.ValidationError(
                    "This flight has been cancelled."
                )

            if flight.available_seats < number_of_seats:
                raise serializers.ValidationError(
                    "Not enough seats available."
                )

            # Calculate price using the database flight price
            total_price = flight.price * number_of_seats

            booking = Booking.objects.create(
                user=self.context['request'].user,
                flight=flight,
                number_of_seats=number_of_seats,
                total_price=total_price,
            )

            # Reduce available seats
            flight.available_seats -= number_of_seats
            flight.save(update_fields=['available_seats'])

        return booking
