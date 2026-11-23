
from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):

    list_display = (
        'booking_reference',
        'user',
        'flight',
        'number_of_seats',
        'total_price',
        'booking_status',
        'payment_status',
        'created_at',
    )

    list_filter = (
        'booking_status',
        'payment_status',
        'created_at',
    )

    search_fields = (
        'booking_reference',
        'user__username',
        'flight__flight_number',
    )
