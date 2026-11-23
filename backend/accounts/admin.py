
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    list_display = (
        'username',
        'email',
        'role',
        'approval_status',
        'is_active',
        'is_staff',
    )

    list_filter = (
        'role',
        'approval_status',
        'is_active',
    )

    fieldsets = UserAdmin.fieldsets + (
        ('AirBooking Information', {
            'fields': ('role', 'approval_status'),
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('AirBooking Information', {
            'fields': ('role', 'approval_status'),
        }),
    )
