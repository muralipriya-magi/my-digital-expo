from unittest.mock import patch

from django.contrib.auth.tokens import default_token_generator
from django.test import TestCase
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .models import User


class PasswordResetApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="visitor",
            email="visitor@example.com",
            password="SafePassword123!",
            role="VISITOR",
        )

    @patch("users.views.send_password_reset_email")
    def test_request_sends_reset_link_for_existing_user(self, send_email):
        response = self.client.post("/api/users/password-reset/", {"email": self.user.email})

        self.assertEqual(response.status_code, 200)
        self.assertTrue(send_email.called)
        self.assertEqual(send_email.call_args.args[0], self.user)

    @patch("users.views.send_password_reset_email")
    def test_request_does_not_disclose_unknown_email(self, send_email):
        response = self.client.post("/api/users/password-reset/", {"email": "unknown@example.com"})

        self.assertEqual(response.status_code, 200)
        self.assertFalse(send_email.called)

    def test_confirm_changes_password_with_valid_link(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        response = self.client.post(
            "/api/users/password-reset/confirm/",
            {
                "uid": uid,
                "token": token,
                "password": "NewSafePassword123!",
                "confirm_password": "NewSafePassword123!",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewSafePassword123!"))
