import logging

from users.emails import send_platform_email
from users.notifications import get_admin_emails

logger = logging.getLogger(__name__)


def send_expo_status_email(expo):
    status_text = expo.status.title().lower()
    subject = f"Expo {status_text}"
    message = (
        f"Hello {expo.organizer.username},\n\n"
        f"Your expo '{expo.title}' has been {status_text} by the admin team."
    )
    send_platform_email(subject, message, [expo.organizer.email])


def send_ticket_admin_alert(expo, visitor, adult_count, child_count, total_amount):
    subject = f"New ticket booking for {expo.title}"
    message = (
        f"A new ticket booking was completed.\n\n"
        f"Expo: {expo.title}\n"
        f"Visitor: {visitor.username}\n"
        f"Email: {visitor.email}\n"
        f"Adults: {adult_count}\n"
        f"Children: {child_count}\n"
        f"Total Amount: Rs. {total_amount}"
    )
    send_platform_email(subject, message, get_admin_emails())


def send_expo_reminder_email(expo, user, reminder_label):
    subject = f"Reminder: {expo.title} is {reminder_label}"
    message = (
        f"Hello {user.username},\n\n"
        f"Your ExpoSphere event is {reminder_label}.\n\n"
        f"Expo: {expo.title}\n"
        f"Date: {expo.start_date:%d %b %Y} to {expo.end_date:%d %b %Y}\n"
        f"Venue: {expo.venue.name}, {expo.city.name}\n\n"
        "Keep your ticket QR code ready for entry. We look forward to seeing you there!"
    )
    return send_platform_email(subject, message, [user.email])
