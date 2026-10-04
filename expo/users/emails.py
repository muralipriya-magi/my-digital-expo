import logging
from html import escape

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from .notifications import get_admin_emails

logger = logging.getLogger(__name__)


def _branded_html(message):
    escaped_message = escape(message).replace("\n", "<br>")
    return f"""
    <div style="margin:0;padding:32px 16px;background:#fff8fc;font-family:Arial,sans-serif;color:#3d0040">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #ffe4ee">
        <div style="padding:24px 30px;background:linear-gradient(135deg,#ff8fab,#c084fc);color:#ffffff">
          <div style="font-size:24px;font-weight:800">ExpoSphere</div>
          <div style="margin-top:4px;opacity:.95">Your exhibition platform</div>
        </div>
        <div style="padding:30px;font-size:16px;line-height:1.7">{escaped_message}</div>
        <div style="padding:18px 30px;background:#fff0f5;color:#7b2d5e;font-size:13px">This is an automated ExpoSphere email.</div>
      </div>
    </div>
    """


def send_platform_email(subject, message, recipients, attachments=None):
    safe_recipients = [email for email in recipients if email]
    if not safe_recipients or not settings.EMAIL_HOST_USER:
        return False

    try:
        email = EmailMultiAlternatives(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            safe_recipients,
        )
        email.attach_alternative(_branded_html(message), "text/html")
        for attachment in attachments or []:
            if attachment:
                email.attach_file(attachment)
        email.send(fail_silently=False)
        return True
    except Exception:
        logger.exception("Failed to send platform email: %s", subject)
        return False


def send_signup_email(user):
    if user.role == "ORGANIZER":
        subject = "Organizer account submitted"
        message = (
            f"Hello {user.username},\n\n"
            "Your organizer account has been created successfully and is waiting for admin approval.\n"
            "You will be able to log in once the admin team approves your account."
        )
    elif user.role == "VENDOR":
        subject = "Vendor account created"
        message = (
            f"Hello {user.username},\n\n"
            "Your vendor account has been created successfully.\n"
            "You can now log in and access the vendor dashboard."
        )
    else:
        subject = "Welcome to ExpoSphere"
        message = (
            f"Hello {user.username},\n\n"
            "Your visitor account has been created successfully.\n"
            "You can now log in and explore exhibitions."
        )

    send_platform_email(subject, message, [user.email])


def send_admin_signup_alert(user):
    subject = "New organizer signup request"
    message = (
        f"A new organizer account is waiting for approval.\n\n"
        f"Username: {user.username}\n"
        f"Email: {user.email}\n"
        f"Phone: {user.phone_number}\n"
        f"Organization: {user.company_name}\n"
        f"Type: {user.business_type}\n"
        f"City: {user.city}"
    )
    send_platform_email(subject, message, get_admin_emails())


def send_organizer_decision_email(user):
    status_text = user.status.title().lower()
    subject = f"Organizer account {status_text}"
    message = (
        f"Hello {user.username},\n\n"
        f"Your organizer account has been {status_text} by the admin team."
    )
    send_platform_email(subject, message, [user.email])


def send_contact_message_to_admin(name, email, message):
    subject = f"New contact enquiry from {name}"
    body = (
        "A new public website contact enquiry was submitted.\n\n"
        f"Name: {name}\n"
        f"Email: {email}\n\n"
        "Message:\n"
        f"{message}"
    )
    send_platform_email(subject, body, get_admin_emails())


def send_password_reset_email(user, uid, token):
    reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
    subject = "Reset your ExpoSphere password"
    message = (
        f"Hello {user.username},\n\n"
        "We received a request to reset your ExpoSphere password. "
        "Use this secure link to choose a new password:\n\n"
        f"{reset_url}\n\n"
        "This link expires automatically. If you did not request a password reset, you can safely ignore this email."
    )
    send_platform_email(subject, message, [user.email])
