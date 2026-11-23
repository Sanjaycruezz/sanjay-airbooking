
from django.urls import path

from .views import (
    AdminFlightListCreateView,
    AdminFlightDetailView,
    FlightStatusUpdateView,
)

urlpatterns = [
    path('', AdminFlightListCreateView.as_view(), name='admin_flight_list_create'),
    path('<int:pk>/', AdminFlightDetailView.as_view(), name='admin_flight_detail'),
    path('<int:pk>/status/', FlightStatusUpdateView.as_view(), name='flight_status_update'),
]
