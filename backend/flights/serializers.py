
from rest_framework import serializers
from .models import Flight


class FlightSerializer(serializers.ModelSerializer):

    class Meta:
        model = Flight
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        # Get submitted values, or existing values during an update
        departure_airport = data.get(
            'departure_airport',
            getattr(self.instance, 'departure_airport', None)
        )

        arrival_airport = data.get(
            'arrival_airport',
            getattr(self.instance, 'arrival_airport', None)
        )

        departure_time = data.get(
            'departure_time',
            getattr(self.instance, 'departure_time', None)
        )

        arrival_time = data.get(
            'arrival_time',
            getattr(self.instance, 'arrival_time', None)
        )

        total_seats = data.get(
            'total_seats',
            getattr(self.instance, 'total_seats', None)
        )

        available_seats = data.get(
            'available_seats',
            getattr(self.instance, 'available_seats', None)
        )

        # Departure and arrival airports must be different
        if departure_airport and arrival_airport:
            if departure_airport.upper() == arrival_airport.upper():
                raise serializers.ValidationError(
                    "Departure and arrival airports cannot be the same."
                )

        # Arrival must be after departure
        if departure_time and arrival_time:
            if arrival_time <= departure_time:
                raise serializers.ValidationError(
                    "Arrival time must be after departure time."
                )

        # Available seats cannot exceed total seats
        if total_seats is not None and available_seats is not None:
            if available_seats > total_seats:
                raise serializers.ValidationError(
                    "Available seats cannot exceed total seats."
                )

        return data


class FlightStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = Flight
        fields = ['id', 'status']
        read_only_fields = ['id']
