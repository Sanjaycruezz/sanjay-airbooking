
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    PendingUsersView,
    UserApprovalView,
)

urlpatterns = [
    # Customer authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User profile
    path('me/', ProfileView.as_view(), name='profile'),

    # Admin user management
    path('admin/pending-users/', PendingUsersView.as_view(), name='pending_users'),
    path(
        'admin/users/<int:pk>/approval/',
        UserApprovalView.as_view(),
        name='user_approval'
    ),
]
