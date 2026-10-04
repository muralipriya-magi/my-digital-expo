from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Notification, User

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone_number', 'company_name', 'business_type', 'city']

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        role = attrs.get("role")

        if role in {"ORGANIZER", "VENDOR"}:
          required_fields = {
              "phone_number": "Phone number is required.",
              "company_name": "Company or organization name is required.",
              "business_type": "Business type is required.",
              "city": "City is required.",
          }

          errors = {
              field: message
              for field, message in required_fields.items()
              if not str(attrs.get(field, "")).strip()
          }

          if errors:
              raise serializers.ValidationError(errors)

        return attrs
        

    def create(self, validated_data):
        user = User.objects.create_user(
            username = validated_data['username'],
            email = validated_data['email'],
            password = validated_data['password'],
            role = validated_data['role'],
            phone_number = validated_data.get('phone_number', ''),
            company_name = validated_data.get('company_name', ''),
            business_type = validated_data.get('business_type', ''),
            city = validated_data.get('city', ''),
        )
        return user

class CustomTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        user = User.objects.filter(email=attrs["email"]).first()
        if not user or not user.check_password(attrs["password"]):
            raise AuthenticationFailed("Invalid email or password")

        if user.role != 'ADMIN' and user.status != 'APPROVED':
            if user.role == "ORGANIZER" and user.status == "PENDING":
                raise serializers.ValidationError(
                    "Your organizer account is pending admin approval. Please wait until the admin team approves your account."
                )

            if user.role == "ORGANIZER" and user.status == "REJECTED":
                raise serializers.ValidationError(
                    "Your organizer account was rejected by the admin team. Please contact support or register again with updated details."
                )

            raise serializers.ValidationError(
                f"{user.role.title()} account is not approved by admin."
            )

        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": user.role,
            "username": user.username,
        }
    
class OrganizerApproveSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['status']
    def validate_status(self, value):
        if value not in ['APPROVED', 'REJECTED']:
            raise serializers.ValidationError("Invalid status")
        return value


class OrganizerListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'status', 'role']


class ContactMessageSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    message = serializers.CharField(max_length=2000)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "is_read", "created_at"]
