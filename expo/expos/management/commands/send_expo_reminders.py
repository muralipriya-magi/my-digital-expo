from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import IntegrityError, transaction
from django.utils import timezone

from expos.emails import send_expo_reminder_email
from expos.models import Expo, ExpoReminder, Ticket
from users.notifications import create_notification


REMINDER_WINDOWS = {
    7: (ExpoReminder.SEVEN_DAYS, "in 7 days"),
    1: (ExpoReminder.ONE_DAY, "tomorrow"),
    0: (ExpoReminder.EVENT_DAY, "today"),
}


class Command(BaseCommand):
    help = "Send once-only ticket-holder reminders for expos starting in 7 days, tomorrow, or today."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Report recipients without sending email or recording reminders.")

    def handle(self, *args, **options):
        today = timezone.localdate()
        dry_run = options["dry_run"]
        sent_count = 0

        for days_until, (reminder_type, label) in REMINDER_WINDOWS.items():
            start_date = today + timedelta(days=days_until)
            expos = Expo.objects.filter(
                status__in=["APPROVED", "ACTIVE"],
                start_date=start_date,
            ).select_related("city", "venue")

            for expo in expos:
                seen_user_ids = set()
                tickets = Ticket.objects.filter(expo=expo).select_related("visitor")
                for ticket in tickets:
                    user = ticket.visitor
                    if user.id in seen_user_ids:
                        continue
                    seen_user_ids.add(user.id)

                    if ExpoReminder.objects.filter(expo=expo, user=user, reminder_type=reminder_type).exists():
                        continue

                    if dry_run:
                        self.stdout.write(f"Would remind {user.email} about {expo.title} ({label}).")
                        sent_count += 1
                        continue

                    try:
                        with transaction.atomic():
                            reminder, created = ExpoReminder.objects.get_or_create(
                                expo=expo,
                                user=user,
                                reminder_type=reminder_type,
                            )
                            if not created:
                                continue
                            delivered = send_expo_reminder_email(expo, user, label)
                            if not delivered:
                                reminder.delete()
                                continue
                    except IntegrityError:
                        continue

                    create_notification(
                        user,
                        f"Expo reminder: {expo.title}",
                        f"Your expo starts {label}. Check your email for event details.",
                    )
                    sent_count += 1

        action = "would be sent" if dry_run else "sent"
        self.stdout.write(self.style.SUCCESS(f"{sent_count} expo reminder(s) {action}."))
