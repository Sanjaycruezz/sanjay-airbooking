
from django.urls import path

from .views import (
    FlightSearchView,
    FlightDetailView,
)

urlpatterns = [
    path('search/', FlightSearchView.as_view(), name='flight_search'),
    path('<int:pk>/', FlightDetailView.as_view(), name='flight_detail'),
]
