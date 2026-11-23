
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'password',
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'],
            role=User.Role.CUSTOMER,
            approval_status=User.ApprovalStatus.PENDING,
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'approval_status',
        ]
        read_only_fields = ['id', 'role', 'approval_status']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        # Check credentials before allowing token generation
        from django.contrib.auth import authenticate

        user = authenticate(
            request=self.context.get('request'),
            username=attrs.get('username'),
            password=attrs.get('password'),
        )

        if user and user.approval_status == User.ApprovalStatus.PENDING:
            raise serializers.ValidationError(
                "Your account is awaiting admin approval."
            )

        if user and user.approval_status == User.ApprovalStatus.REJECTED:
            raise serializers.ValidationError(
                "Your account registration has been rejected."
            )

        return super().validate(attrs)


class AdminApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'approval_status']
        read_only_fields = ['id', 'username', 'email']

    def validate_approval_status(self, value):
        if value not in [
            User.ApprovalStatus.APPROVED,
            User.ApprovalStatus.REJECTED,
        ]:
            raise serializers.ValidationError(
                "Status must be approved or rejected."
            )
        return value
