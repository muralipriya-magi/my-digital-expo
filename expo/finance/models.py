from django.db import models
from django.conf import settings
from expos.models import Expo
from uuid import uuid4

# Create your models here.
class Transaction(models.Model):
    TYPE_CHOICES = (
        ('STALL', 'Stall Booking'),
        ('TICKET', 'Ticket Booking'),
    )
    PAYMENT_METHOD_CHOICES = (
        ('CARD', 'Card'),
        ('UPI', 'UPI'),
        ('NETBANKING', 'Net Banking'),
        ('WALLET', 'Wallet'),
    )
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    expo = models.ForeignKey(Expo, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    organizer_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='CARD')
    payment_reference = models.CharField(max_length=64, unique=True, default=uuid4)
    gateway_order_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    gateway_payment_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    gateway_signature = models.CharField(max_length=255, blank=True)
    booking_payload = models.JSONField(default=dict, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type}"
