
from django.urls import path

from .payment_views import SimulatedPaymentView

from .views import (
    BookingCreateView,
    MyBookingsView,
    BookingDetailView,
    BookingCancelView,
)

urlpatterns = [
    path('', BookingCreateView.as_view(), name='booking_create'),
    path('my/', MyBookingsView.as_view(), name='my_bookings'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking_detail'),
    path('<int:pk>/cancel/', BookingCancelView.as_view(), name='booking_cancel'),
    path(
        '<int:pk>/payment/',
        SimulatedPaymentView.as_view(),
        name='booking_payment'
    ),
    path(
    '<int:pk>/cancel/',
    BookingCancelView.as_view(),
    name='booking_cancel'
    ),
]
