
from django.urls import path

from .admin_views import (
    AdminBookingListView,
    AdminBookingDetailView,
)

urlpatterns = [
    path(
        '',
        AdminBookingListView.as_view(),
        name='admin_booking_list'
    ),

    path(
        '<int:pk>/',
        AdminBookingDetailView.as_view(),
        name='admin_booking_detail'
    ),
]
