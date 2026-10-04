from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    ROLE_CHIOCES = (
        ('ADMIN','Admin'),
        ('ORGANIZER','Organiser'),
        ('VENDOR','Vendor'),
        ('VISITOR','Visitor'),
    )
    STATUS_CHOICES = (
        ('PENDING','Pending'),
        ('APPROVED','Approved'),
        ('REJECTED','Rejected'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHIOCES)
    status = models.CharField(
        max_length=20,
        choices= STATUS_CHOICES,
        default='PENDING'
    )
    phone_number = models.CharField(max_length=20, blank=True)
    company_name = models.CharField(max_length=200, blank=True)
    business_type = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=120, blank=True)

    def save(self, *args, **kwargs):
        # Vendors and visitors can use the product immediately.
        if self.role in {'VISITOR', 'VENDOR'}:
            self.status = 'APPROVED'

        #admin always approved
        if self.is_superuser:
            self.role = 'ADMIN'
            self.status = 'APPROVED'

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.title}"
