from datetime import timedelta
from unittest.mock import patch

from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone

from users.models import Notification, User

from .models import City, Expo, ExpoReminder, Theme, Ticket, Venue


class ExpoReminderCommandTests(TestCase):
    def setUp(self):
        organizer = User.objects.create_user(
            username="organizer",
            email="organizer@example.com",
            password="SafePassword123!",
            role="ORGANIZER",
            status="APPROVED",
        )
        self.visitor = User.objects.create_user(
            username="visitor",
            email="visitor@example.com",
            password="SafePassword123!",
            role="VISITOR",
        )
        city = City.objects.create(name="Chennai")
        venue = Venue.objects.create(name="Expo Centre", city=city, address="Main Road", capacity=500)
        theme = Theme.objects.create(name="Technology", description="Tech expo", default_duration_days=2)
        self.expo = Expo.objects.create(
            title="Tomorrow Expo",
            description="An event reminder test",
            theme=theme,
            organizer=organizer,
            city=city,
            venue=venue,
            start_date=timezone.localdate() + timedelta(days=1),
            end_date=timezone.localdate() + timedelta(days=2),
            max_stalls=10,
            max_visitors=100,
            status="ACTIVE",
        )
        Ticket.objects.create(expo=self.expo, visitor=self.visitor)

    @patch("expos.management.commands.send_expo_reminders.send_expo_reminder_email", return_value=True)
    def test_command_sends_one_reminder_only(self, send_email):
        call_command("send_expo_reminders")
        call_command("send_expo_reminders")

        self.assertEqual(send_email.call_count, 1)
        self.assertEqual(ExpoReminder.objects.count(), 1)
        self.assertEqual(Notification.objects.filter(user=self.visitor).count(), 1)
