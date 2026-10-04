from rest_framework.exceptions import PermissionDenied
from rest_framework import generics, status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes

from .models import Notification, User
from .emails import send_admin_signup_alert, send_contact_message_to_admin, send_organizer_decision_email, send_password_reset_email, send_signup_email
from .notifications import create_notification, notify_admins
from .serializers import (
    ContactMessageSerializer,
    CustomTokenObtainPairSerializer,
    NotificationSerializer,
    OrganizerApproveSerializer,
    OrganizerListSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    SignUpSerializer,
)

# Create your views here.
class SignUpView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignUpSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        send_signup_email(user)

        if user.role == "ORGANIZER":
            create_notification(
                user,
                "Organizer account submitted",
                "Your organizer account is pending admin approval.",
            )
            notify_admins(
                "New organizer approval request",
                f"{user.username} signed up as an organizer and is waiting for approval.",
            )
            send_admin_signup_alert(user)
        elif user.role == "VENDOR":
            create_notification(
                user,
                "Vendor account created",
                "Your vendor account is ready. You can start exploring approved expos and request stalls.",
            )
        elif user.role == "VISITOR":
            create_notification(
                user,
                "Welcome to ExpoSphere",
                "Your visitor account is ready. Explore expos and book tickets anytime.",
            )

class CustomLoginView(GenericAPIView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class OrganizerListView(generics.ListAPIView):
    serializer_class = OrganizerListSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.filter(role="ORGANIZER")
        status_value = self.request.query_params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)
        return queryset.order_by("id")

class OrganizerApprovalView(generics.UpdateAPIView):
    queryset = User.objects.filter(role='ORGANIZER')
    serializer_class = OrganizerApproveSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def perform_update(self, serializer):
        user = self.get_object()
        if user.role != "ORGANIZER":
            raise PermissionDenied("Only organizer can be approved")
        updated_user = serializer.save()
        status_text = updated_user.status.title().lower()
        create_notification(
            updated_user,
            f"Organizer account {status_text}",
            f"Your organizer account has been {status_text} by the admin team.",
        )
        send_organizer_decision_email(updated_user)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "Notifications marked as read."})


class ContactMessageView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload = serializer.validated_data
        send_contact_message_to_admin(
            payload["name"],
            payload["email"],
            payload["message"],
        )

        return Response(
            {"message": "Your message has been sent to the admin team."},
            status=status.HTTP_200_OK,
        )


class PasswordResetRequestView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Always return the same response so this endpoint cannot reveal which
        # email addresses have accounts.
        user = User.objects.filter(email__iexact=serializer.validated_data["email"]).first()
        if user and user.is_active:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            send_password_reset_email(user, uid, token)

        return Response({"message": "If an account exists for this email, a password-reset link has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            user_id = force_str(urlsafe_base64_decode(data["uid"]))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise PermissionDenied("This password-reset link is invalid or has expired.")

        if not default_token_generator.check_token(user, data["token"]):
            raise PermissionDenied("This password-reset link is invalid or has expired.")

        user.set_password(data["password"])
        user.save(update_fields=["password"])
        return Response({"message": "Your password has been reset. You can now log in."})

