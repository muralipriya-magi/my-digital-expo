import uuid
import qrcode
from io import BytesIO
from django.db import models
from django.conf import settings
from django.core.files import File

# Create your models here.
class City(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Venue(models.Model):
    name = models.CharField(max_length=200)
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    address = models.TextField()
    capacity = models.IntegerField()

    def __str__(self):
        return f"{self.name} - {self.city.name}"
    
class Theme(models.Model):
    name = models. CharField(max_length=200, unique=True)
    description = models.TextField()
    default_duration_days = models.IntegerField()
    image = models.ImageField(upload_to='theme_images/', blank=True, null=True)

    def __str__(self):
        return self.name
    
class ThemeFeature(models.Model):
    theme = models.ForeignKey(Theme, on_delete=models.CASCADE, related_name="features")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name}({self.theme.name})"

class Expo(models.Model):
    STATUS_CHOICES = (
        ('PENDING','Pending'),
        ('APPROVED','Approved'),
        ('REJECTED','Rejected'),
        ('ACTIVE','Active'),
        ('COMPLETED','Completed'),
    )
    title = models.CharField(max_length=200)
    description =models.TextField()
    theme = models. ForeignKey(Theme, on_delete=models.CASCADE)
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    max_stalls = models.IntegerField()
    max_visitors = models. IntegerField()
     # Pricing Fields 
    stall_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    ticket_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    platform_commission_percent = models.DecimalField(max_digits=5, decimal_places=2, default=70)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class StallBooking(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED','Approved'),
        ('REJECTED', 'Rejected'),
    )
    expo = models.ForeignKey(Expo, on_delete=models.CASCADE)
    vendor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    stall_name = models.CharField(max_length=200)
    stall_description = models.TextField()
    requested_data = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    def __str__(self):
        return f"{self.stall_name}-{self.vendor.username}"
    

class Ticket(models.Model):
    ADULT = "ADULT"
    CHILD = "CHILD"
    TICKET_TYPE_CHOICES = (
        (ADULT, "Adult"),
        (CHILD, "Child"),
    )

    expo = models.ForeignKey(Expo, on_delete=models.CASCADE)
    visitor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    ticket_type = models.CharField(max_length=20, choices=TICKET_TYPE_CHOICES, default=ADULT)
    price_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    ticket_code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    qr_code_image = models.ImageField(upload_to='qr_codes/', blank=True)

    qr_verified = models.BooleanField(default=False)

    booking_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        # Save first so ticket_code exists
        super().save(*args, **kwargs)

        # Generate QR code only if not already created
        if not self.qr_code_image:
            qr = qrcode.make(str(self.ticket_code))

            buffer = BytesIO()
            qr.save(buffer, format='PNG')

            file_name = f"ticket_{self.ticket_code}.png"

            self.qr_code_image.save(file_name, File(buffer), save=False)

            super().save(update_fields=['qr_code_image'])
    def __str__(self):
        return f"{self.visitor.username} - {self.expo.title} - {self.ticket_type}"

class TicketScanHistory(models.Model):

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE
    )

    scanned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    scanned_at = models.DateTimeField(auto_now_add=True)

    gate_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.ticket.ticket_code} scanned at {self.gate_name}"


class ExpoReminder(models.Model):
    SEVEN_DAYS = "SEVEN_DAYS"
    ONE_DAY = "ONE_DAY"
    EVENT_DAY = "EVENT_DAY"
    REMINDER_TYPES = (
        (SEVEN_DAYS, "7 days before"),
        (ONE_DAY, "1 day before"),
        (EVENT_DAY, "Event day"),
    )

    expo = models.ForeignKey(Expo, on_delete=models.CASCADE, related_name="reminders")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="expo_reminders")
    reminder_type = models.CharField(max_length=20, choices=REMINDER_TYPES)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["expo", "user", "reminder_type"], name="unique_expo_reminder"),
        ]

    def __str__(self):
        return f"{self.expo.title}: {self.user.email} ({self.reminder_type})"
   
