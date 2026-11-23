
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    AdminApprovalSerializer,
)


# Customer registration
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# JWT login
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


# Logged-in user's profile
class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# Permission for AirBooking admins
class IsAirBookingAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user

        return (
            user.is_authenticated
            and user.is_active
            and (
                user.is_superuser
                or (
                    user.role == User.Role.ADMIN
                    and user.is_staff
                )
            )
        )


# Admin: view users awaiting approval
class PendingUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAirBookingAdmin]

    def get_queryset(self):
        return User.objects.filter(
            approval_status=User.ApprovalStatus.PENDING,
            role=User.Role.CUSTOMER,
        ).order_by('-date_joined')


# Admin: approve or reject a user
class UserApprovalView(generics.UpdateAPIView):
    queryset = User.objects.filter(role=User.Role.CUSTOMER)
    serializer_class = AdminApprovalSerializer
    permission_classes = [IsAirBookingAdmin]
    http_method_names = ['patch']

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": f"User {instance.username} has been "
                       f"{instance.approval_status}.",
            "user": serializer.data,
        })
