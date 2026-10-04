import logging
from rest_framework import serializers
from .models import Expo, StallBooking, Ticket
from decimal import Decimal
from finance.models import Transaction
from uuid import uuid4
from django.db import transaction as db_transaction
from django.conf import settings
from users.emails import send_platform_email

logger = logging.getLogger(__name__)
FIXED_PLATFORM_COMMISSION_PERCENT = Decimal("70.00")
CHILD_TICKET_DISCOUNT_PERCENT = Decimal("50.00")


def get_child_ticket_price(expo):
    return (expo.ticket_price * CHILD_TICKET_DISCOUNT_PERCENT) / Decimal(100)


def build_media_url(request, file_field):
    if not file_field:
        return None
    url = file_field.url
    return request.build_absolute_uri(url) if request else url


def send_ticket_confirmation_email(ticket, user, expo):
    subject = "Expo Ticket Confirmation"
    message = f"Hello {user.username}, your {ticket.ticket_type.lower()} ticket for {expo.title} has been successfully booked."
    attachment = ticket.qr_code_image.path if ticket.qr_code_image else None
    return send_platform_email(subject, message, [user.email], attachments=[attachment])

class ExpoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expo
        fields = [
            'title',
            'description',
            'theme',
            'city',
            'venue',
            'start_date',
            'end_date',
            'max_stalls',
            'max_visitors',
            'stall_price',
            'ticket_price',
        ]

    def validate(self, attrs):
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        city = attrs.get("city")
        venue = attrs.get("venue")

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date must be on or after the start date."})

        if city and venue and venue.city_id != city.id:
            raise serializers.ValidationError({"venue": "Selected venue does not belong to the selected city."})

        if attrs.get("max_stalls", 0) <= 0:
            raise serializers.ValidationError({"max_stalls": "Max stalls must be greater than 0."})

        if attrs.get("max_visitors", 0) <= 0:
            raise serializers.ValidationError({"max_visitors": "Max visitors must be greater than 0."})

        if attrs.get("stall_price", 0) < 0:
            raise serializers.ValidationError({"stall_price": "Stall price cannot be negative."})

        if attrs.get("ticket_price", 0) < 0:
            raise serializers.ValidationError({"ticket_price": "Ticket price cannot be negative."})

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        expo = Expo.objects.create(
            organizer = user,
            status = 'PENDING',
            **validated_data
        )
        return expo
    
class StallBookingSerializer(serializers.ModelSerializer):
    payment_method = serializers.ChoiceField(choices=Transaction.PAYMENT_METHOD_CHOICES, write_only=True)

    class Meta:
        model = StallBooking
        fields = ['expo', 'stall_name', 'stall_description', 'payment_method']
    def validate(self, data):
        expo = data['expo']
        # Vendors can request stalls once admin has approved the expo.
        if expo.status not in ['APPROVED', 'ACTIVE']:
            raise serializers.ValidationError("Expo is not approved for stall booking")
        # check stall capacity
        approved_stalls = StallBooking.objects.filter(
            expo=expo,
            status='APPROVED'
        ).count()
        if approved_stalls >= expo.max_stalls:
            raise serializers.ValidationError("No more stalls available")
        return data
    def create(self, validated_data):
        user = self.context['request'].user
        expo = validated_data['expo']
        payment_method = validated_data.pop('payment_method')

        stall = StallBooking.objects.create(
            vendor=user,
            status='PENDING',
            **validated_data
        )
        # Payment Simulation
        stall_price = expo.stall_price
        commission = (stall_price * FIXED_PLATFORM_COMMISSION_PERCENT) / Decimal(100)
        organizer_amount = stall_price - commission
        Transaction.objects.create(
            user=user,
            expo=expo,
            transaction_type='STALL',
            amount=stall_price,
            commission_amount=commission,
            organizer_amount=organizer_amount,
            payment_method=payment_method,
            payment_reference=f"STALL-{uuid4().hex[:12].upper()}",
            status='SUCCESS'
        )

        return stall
class StallApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = StallBooking
        fields = ['status']
    def validate_status(self, value):
        if value not in ['APPROVED', 'REJECTED']:
            raise serializers.ValidationError("Invalid status update")
        return value
    
class ExpoApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expo
        fields = ['status', 'is_featured']

    def validate_status(self, value):
        if value not in ['APPROVED', 'REJECTED', 'ACTIVE']:
            raise serializers.ValidationError("Invalid status update.")
        return value

    def validate(self, attrs):
        instance = self.instance
        next_status = attrs.get("status", instance.status if instance else None)
        next_is_featured = attrs.get("is_featured", instance.is_featured if instance else False)

        if next_is_featured and next_status not in ["APPROVED", "ACTIVE"]:
            raise serializers.ValidationError({
                "is_featured": "Only approved or active expos can be marked as featured."
            })

        return attrs

    def update(self, instance, validated_data):
        mark_featured = validated_data.get("is_featured", None)

        if mark_featured is True:
            Expo.objects.exclude(pk=instance.pk).update(is_featured=False)

        return super().update(instance, validated_data)
class TicketSerializer(serializers.Serializer):
    expo = serializers.PrimaryKeyRelatedField(queryset=Expo.objects.all())
    payment_method = serializers.ChoiceField(choices=Transaction.PAYMENT_METHOD_CHOICES, write_only=True)
    adult_count = serializers.IntegerField(min_value=0, required=False, default=0)
    child_count = serializers.IntegerField(min_value=0, required=False, default=0)

    def validate(self, data):
        expo = data['expo']
        adult_count = data.get("adult_count", 0)
        child_count = data.get("child_count", 0)
        total_requested = adult_count + child_count

        # Visitors can book once the expo is approved by admin.
        if expo.status not in ["APPROVED", "ACTIVE"]:
            raise serializers.ValidationError("Expo is not approved for ticket booking")

        if total_requested <= 0:
            raise serializers.ValidationError("Choose at least one adult or child ticket.")

        # check visitor capacity
        total_tickets = Ticket.objects.filter(expo=expo).count()

        if total_tickets + total_requested > expo.max_visitors:
            raise serializers.ValidationError("Expo visitor limit reached")

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        expo = validated_data['expo']
        payment_method = validated_data.pop('payment_method')
        adult_count = validated_data.pop("adult_count", 0)
        child_count = validated_data.pop("child_count", 0)
        child_ticket_price = get_child_ticket_price(expo)

        if expo.status not in ["APPROVED", "ACTIVE"]:
            raise serializers.ValidationError("Expo is not approved for ticket booking")

        with db_transaction.atomic():
            tickets = []

            for _ in range(adult_count):
                tickets.append(Ticket.objects.create(
                    visitor=user,
                    expo=expo,
                    ticket_type=Ticket.ADULT,
                    price_paid=expo.ticket_price,
                ))

            for _ in range(child_count):
                tickets.append(Ticket.objects.create(
                    visitor=user,
                    expo=expo,
                    ticket_type=Ticket.CHILD,
                    price_paid=child_ticket_price,
                ))

            total_amount = (expo.ticket_price * adult_count) + (child_ticket_price * child_count)
            commission = (total_amount * FIXED_PLATFORM_COMMISSION_PERCENT) / Decimal(100)
            organizer_amount = total_amount - commission

            Transaction.objects.create(
                user=user,
                expo=expo,
                transaction_type='TICKET',
                amount=total_amount,
                commission_amount=commission,
                organizer_amount=organizer_amount,
                payment_method=payment_method,
                payment_reference=f"TICKET-{uuid4().hex[:12].upper()}",
                status='SUCCESS'
            )

            def _send_confirmation():
                for ticket in tickets:
                    try:
                        send_ticket_confirmation_email(ticket, user, expo)
                    except Exception:
                        logger.exception("Failed to send ticket confirmation email for ticket %s", ticket.id)

            db_transaction.on_commit(_send_confirmation)

        return {
            "expo": expo,
            "tickets": tickets,
            "adult_count": adult_count,
            "child_count": child_count,
            "total_amount": total_amount,
        }
class ExpoListSerializer(serializers.ModelSerializer):
    theme = serializers.StringRelatedField()
    city = serializers.StringRelatedField()
    venue = serializers.StringRelatedField()
    theme_image = serializers.SerializerMethodField()
    child_ticket_price = serializers.SerializerMethodField()
    class Meta:
        model = Expo
        fields =[
            'id',
            'title',
            'description',
            'theme',
            'city',
            'venue',
            'theme_image',
            'stall_price',
            'ticket_price',
            'child_ticket_price',
            'start_date',
            'end_date',
            'is_featured',

        ]

    def get_theme_image(self, obj):
        return build_media_url(self.context.get("request"), obj.theme.image)

    def get_child_ticket_price(self, obj):
        return get_child_ticket_price(obj)


class OrganizerExpoSerializer(serializers.ModelSerializer):
    theme = serializers.StringRelatedField()
    city = serializers.StringRelatedField()
    venue = serializers.StringRelatedField()
    theme_image = serializers.SerializerMethodField()
    platform_commission_percent = serializers.SerializerMethodField()

    class Meta:
        model = Expo
        fields = [
            'id',
            'title',
            'description',
            'theme',
            'city',
            'venue',
            'theme_image',
            'start_date',
            'end_date',
            'status',
            'stall_price',
            'ticket_price',
            'platform_commission_percent',
            'max_stalls',
            'max_visitors',
            'is_featured',
        ]

    def get_theme_image(self, obj):
        return build_media_url(self.context.get("request"), obj.theme.image)

    def get_platform_commission_percent(self, obj):
        return FIXED_PLATFORM_COMMISSION_PERCENT


class FeaturedExpoSerializer(ExpoListSerializer):
    class Meta(ExpoListSerializer.Meta):
        fields = ExpoListSerializer.Meta.fields


class VendorBookingListSerializer(serializers.ModelSerializer):
    expo_title = serializers.CharField(source='expo.title', read_only=True)
    expo_theme = serializers.CharField(source='expo.theme.name', read_only=True)
    expo_city = serializers.CharField(source='expo.city.name', read_only=True)
    expo_venue = serializers.CharField(source='expo.venue.name', read_only=True)
    expo_start_date = serializers.DateField(source='expo.start_date', read_only=True)
    expo_end_date = serializers.DateField(source='expo.end_date', read_only=True)
    amount = serializers.DecimalField(source='expo.stall_price', max_digits=10, decimal_places=2, read_only=True)
    theme_image = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    payment_reference = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    payment_date = serializers.SerializerMethodField()

    class Meta:
        model = StallBooking
        fields = [
            'id',
            'expo',
            'expo_title',
            'expo_theme',
            'expo_city',
            'expo_venue',
            'expo_start_date',
            'expo_end_date',
            'theme_image',
            'stall_name',
            'stall_description',
            'status',
            'amount',
            'payment_method',
            'payment_reference',
            'payment_status',
            'payment_date',
        ]

    def get_theme_image(self, obj):
        return build_media_url(self.context.get("request"), obj.expo.theme.image)

    def _get_transaction(self, obj):
        if hasattr(obj, "_stall_transaction"):
            return obj._stall_transaction
        transaction = (
            Transaction.objects.filter(
                user=obj.vendor,
                expo=obj.expo,
                transaction_type="STALL",
            )
            .order_by("-created_at")
            .first()
        )
        obj._stall_transaction = transaction
        return transaction

    def get_payment_method(self, obj):
        transaction = self._get_transaction(obj)
        return transaction.payment_method if transaction else None

    def get_payment_reference(self, obj):
        transaction = self._get_transaction(obj)
        return transaction.payment_reference if transaction else None

    def get_payment_status(self, obj):
        transaction = self._get_transaction(obj)
        return transaction.status if transaction else None

    def get_payment_date(self, obj):
        transaction = self._get_transaction(obj)
        return transaction.created_at if transaction else None


class OrganizerStallRequestSerializer(serializers.ModelSerializer):
    expo_title = serializers.CharField(source='expo.title', read_only=True)
    vendor_name = serializers.CharField(source='vendor.username', read_only=True)
    vendor_email = serializers.CharField(source='vendor.email', read_only=True)

    class Meta:
        model = StallBooking
        fields = [
            'id',
            'expo',
            'expo_title',
            'vendor_name',
            'vendor_email',
            'stall_name',
            'stall_description',
            'status',
        ]


class TicketListSerializer(serializers.ModelSerializer):
    expo_title = serializers.CharField(source='expo.title', read_only=True)
    expo_theme = serializers.CharField(source='expo.theme.name', read_only=True)
    expo_city = serializers.CharField(source='expo.city.name', read_only=True)
    expo_venue = serializers.CharField(source='expo.venue.name', read_only=True)
    expo_start_date = serializers.DateField(source='expo.start_date', read_only=True)
    expo_end_date = serializers.DateField(source='expo.end_date', read_only=True)
    qr_code_image = serializers.SerializerMethodField()
    theme_image = serializers.SerializerMethodField()
    ticket_type_display = serializers.CharField(source="get_ticket_type_display", read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id',
            'expo',
            'expo_title',
            'expo_theme',
            'expo_city',
            'expo_venue',
            'expo_start_date',
            'expo_end_date',
            'ticket_type',
            'ticket_type_display',
            'price_paid',
            'ticket_code',
            'qr_code_image',
            'theme_image',
            'qr_verified',
            'booking_date',
        ]

    def get_qr_code_image(self, obj):
        return build_media_url(self.context.get("request"), obj.qr_code_image)

    def get_theme_image(self, obj):
        return build_media_url(self.context.get("request"), obj.expo.theme.image)
