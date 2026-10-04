from .models import Notification, User


def create_notification(user, title, message):
    if not user:
        return None
    return Notification.objects.create(user=user, title=title, message=message)


def notify_admins(title, message):
    admins = User.objects.filter(is_superuser=True)
    if not admins.exists():
        admins = User.objects.filter(role="ADMIN")

    notifications = [
        Notification(user=admin, title=title, message=message)
        for admin in admins
    ]
    if notifications:
        Notification.objects.bulk_create(notifications)


def get_admin_emails():
    admins = User.objects.filter(is_superuser=True)
    if not admins.exists():
        admins = User.objects.filter(role="ADMIN")

    return [email for email in admins.values_list("email", flat=True) if email]
