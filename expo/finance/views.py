import hmac
import logging
from decimal import Decimal
from hashlib import sha256

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db import transaction as db_transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Sum
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied

from expos.models import Expo, StallBooking, Ticket
from users.notifications import create_notification
from users.models import User
from users.permissions import IsOrganizer

from .models import Transaction
from .razorpay_client import RazorpayAPIError, RazorpayConfigError, create_order
from .serializers import TransactionSerializer
from django.db.models.functions import TruncMonth
from users.emails import send_platform_email

logger = logging.getLogger(__name__)
FIXED_PLATFORM_COMMISSION_PERCENT = Decimal("70.00")
CHILD_TICKET_DISCOUNT_PERCENT = Decimal("50.00")


def _transaction_split(expo, amount):
    commission = (amount * FIXED_PLATFORM_COMMISSION_PERCENT) / Decimal(100)
    organizer_amount = amount - commission
    return commission, organizer_amount


def _child_ticket_price(expo):
    return (expo.ticket_price * CHILD_TICKET_DISCOUNT_PERCENT) / Decimal(100)


def _send_ticket_email(ticket):
    user = ticket.visitor
    expo = ticket.expo
    subject = "Expo Ticket Confirmation"
    message = f"Hello {user.username}, your ticket for {expo.title} has been successfully booked."

    attachment = ticket.qr_code_image.path if ticket.qr_code_image else None
    return send_platform_email(subject, message, [user.email], attachments=[attachment])


class RazorpayCreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        expo_id = request.data.get("expo")
        transaction_type = request.data.get("transaction_type")
        payment_method = request.data.get("payment_method", "CARD")

        if transaction_type not in {"STALL", "TICKET"}:
            return Response({"error": "Invalid transaction type."}, status=status.HTTP_400_BAD_REQUEST)
        if payment_method not in dict(Transaction.PAYMENT_METHOD_CHOICES):
            return Response({"error": "Invalid payment method."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            expo = Expo.objects.get(id=expo_id)
        except Expo.DoesNotExist:
            return Response({"error": "Expo not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        booking_payload = {}

        if transaction_type == "TICKET":
            if expo.status not in {"APPROVED", "ACTIVE"}:
                return Response({"error": "Expo is not approved for ticket booking."}, status=status.HTTP_400_BAD_REQUEST)
            if user.role != "VISITOR":
                return Response({"error": "Only visitors can book tickets."}, status=status.HTTP_403_FORBIDDEN)
            try:
                adult_count = int(request.data.get("adult_count", 0) or 0)
                child_count = int(request.data.get("child_count", 0) or 0)
            except (TypeError, ValueError):
                return Response({"error": "Ticket quantities must be whole numbers."}, status=status.HTTP_400_BAD_REQUEST)
            if adult_count < 0 or child_count < 0:
                return Response({"error": "Ticket quantities cannot be negative."}, status=status.HTTP_400_BAD_REQUEST)
            total_requested = adult_count + child_count
            if total_requested <= 0:
                return Response({"error": "Choose at least one adult or child ticket."}, status=status.HTTP_400_BAD_REQUEST)
            if Ticket.objects.filter(expo=expo).count() + total_requested > expo.max_visitors:
                return Response({"error": "Expo visitor limit reached."}, status=status.HTTP_400_BAD_REQUEST)
            booking_payload = {
                "adult_count": adult_count,
                "child_count": child_count,
            }
            amount = (expo.ticket_price * adult_count) + (_child_ticket_price(expo) * child_count)
        else:
            if expo.status not in {"APPROVED", "ACTIVE"}:
                return Response({"error": "Expo is not approved for stall booking."}, status=status.HTTP_400_BAD_REQUEST)
            if user.role != "VENDOR":
                return Response({"error": "Only vendors can book stalls."}, status=status.HTTP_403_FORBIDDEN)
            if StallBooking.objects.filter(expo=expo, status="APPROVED").count() >= expo.max_stalls:
                return Response({"error": "No more stalls available."}, status=status.HTTP_400_BAD_REQUEST)

            stall_name = request.data.get("stall_name")
            stall_description = request.data.get("stall_description")
            if not stall_name or not stall_description:
                return Response({"error": "Stall name and description are required."}, status=status.HTTP_400_BAD_REQUEST)

            booking_payload = {
                "stall_name": stall_name,
                "stall_description": stall_description,
            }
            amount = expo.stall_price

        if amount is None or amount <= 0:
            return Response(
                {"error": "Set a price greater than 0 before using Razorpay checkout."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        commission, organizer_amount = _transaction_split(expo, amount)

        transaction = Transaction.objects.create(
            user=user,
            expo=expo,
            transaction_type=transaction_type,
            amount=amount,
            commission_amount=commission,
            organizer_amount=organizer_amount,
            payment_method=payment_method,
            status="PENDING",
            booking_payload=booking_payload,
        )

        try:
            order = create_order(
                amount_paise=int(amount * 100),
                receipt=str(transaction.payment_reference)[:40],
                notes={
                    "expo_id": str(expo.id),
                    "user_id": str(user.id),
                    "transaction_type": transaction_type,
                },
            )
        except RazorpayConfigError as exc:
            transaction.status = "FAILED"
            transaction.save(update_fields=["status"])
            return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except RazorpayAPIError as exc:
            transaction.status = "FAILED"
            transaction.save(update_fields=["status"])
            return Response({"error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        transaction.gateway_order_id = order["id"]
        transaction.save(update_fields=["gateway_order_id"])

        return Response({
            "transaction_id": transaction.id,
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key": settings.RAZORPAY_KEY_ID,
            "mode": settings.RAZORPAY_MODE,
            "name": "ExpoSphere",
            "description": f"{expo.title} {transaction_type.title()} Payment",
            "prefill": {
                "name": user.username,
                "email": user.email,
            },
        })


class RazorpayVerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        transaction_id = request.data.get("transaction_id")
        payment_id = request.data.get("razorpay_payment_id")
        order_id = request.data.get("razorpay_order_id")
        signature = request.data.get("razorpay_signature")

        try:
            transaction = Transaction.objects.get(id=transaction_id, user=request.user)
        except Transaction.DoesNotExist:
            return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

        if transaction.status == "SUCCESS":
            return Response({"message": "Payment already verified."})
        if transaction.status != "PENDING":
            return Response({"error": "This payment is no longer pending."}, status=status.HTTP_400_BAD_REQUEST)
        if not payment_id or not order_id or not signature or not transaction.gateway_order_id:
            return Response({"error": "Incomplete Razorpay payment response."}, status=status.HTTP_400_BAD_REQUEST)

        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
            f"{transaction.gateway_order_id}|{payment_id}".encode("utf-8"),
            sha256,
        ).hexdigest()

        if transaction.gateway_order_id != order_id or not hmac.compare_digest(expected_signature, signature):
            transaction.status = "FAILED"
            transaction.save(update_fields=["status"])
            return Response({"error": "Payment verification failed."}, status=status.HTTP_400_BAD_REQUEST)

        if transaction.transaction_type == "TICKET":
            with db_transaction.atomic():
                transaction = Transaction.objects.select_for_update().get(id=transaction.id)
                if transaction.status == "SUCCESS":
                    return Response({"message": "Payment already verified."})
                if transaction.status != "PENDING":
                    return Response({"error": "This payment is no longer pending."}, status=status.HTTP_400_BAD_REQUEST)
                expo = Expo.objects.select_for_update().get(id=transaction.expo_id)
                adult_count = int(transaction.booking_payload.get("adult_count", 0) or 0)
                child_count = int(transaction.booking_payload.get("child_count", 0) or 0)
                total_requested = adult_count + child_count
                if expo.status not in {"APPROVED", "ACTIVE"}:
                    return Response({"error": "Expo is no longer available for ticket booking."}, status=status.HTTP_409_CONFLICT)
                if Ticket.objects.filter(expo=expo).count() + total_requested > expo.max_visitors:
                    return Response({"error": "Expo visitor limit was reached before payment could be confirmed."}, status=status.HTTP_409_CONFLICT)
                transaction.gateway_payment_id = payment_id
                transaction.gateway_signature = signature
                transaction.status = "SUCCESS"
                transaction.save(update_fields=["gateway_payment_id", "gateway_signature", "status"])

                tickets = []

                for _ in range(adult_count):
                    tickets.append(Ticket.objects.create(
                        expo=expo,
                        visitor=request.user,
                        ticket_type=Ticket.ADULT,
                        price_paid=expo.ticket_price,
                    ))

                for _ in range(child_count):
                    tickets.append(Ticket.objects.create(
                        expo=expo,
                        visitor=request.user,
                        ticket_type=Ticket.CHILD,
                        price_paid=_child_ticket_price(expo),
                    ))

                create_notification(
                    request.user,
                    "Ticket booked successfully",
                    f"Your booking for '{transaction.expo.title}' is confirmed with {adult_count} adult and {child_count} child tickets.",
                )
                create_notification(
                    transaction.expo.organizer,
                    "New visitor ticket booked",
                    f"A visitor booked {adult_count + child_count} tickets for '{transaction.expo.title}'.",
                )

                def _send_confirmation():
                    for ticket in tickets:
                        try:
                            _send_ticket_email(ticket)
                        except Exception:
                            logger.exception("Failed to send Razorpay ticket confirmation email for ticket %s", ticket.id)

                db_transaction.on_commit(_send_confirmation)

            return Response({
                "message": "Payment verified and ticket booked successfully.",
                "booking_type": "TICKET",
            })

        with db_transaction.atomic():
            transaction = Transaction.objects.select_for_update().get(id=transaction.id)
            if transaction.status == "SUCCESS":
                return Response({"message": "Payment already verified."})
            if transaction.status != "PENDING":
                return Response({"error": "This payment is no longer pending."}, status=status.HTTP_400_BAD_REQUEST)
            expo = Expo.objects.select_for_update().get(id=transaction.expo_id)
            if expo.status not in {"APPROVED", "ACTIVE"}:
                return Response({"error": "Expo is no longer available for stall booking."}, status=status.HTTP_409_CONFLICT)
            transaction.gateway_payment_id = payment_id
            transaction.gateway_signature = signature
            transaction.status = "SUCCESS"
            transaction.save(update_fields=["gateway_payment_id", "gateway_signature", "status"])

            stall = StallBooking.objects.create(
                expo=expo,
                vendor=request.user,
                stall_name=transaction.booking_payload.get("stall_name", "New Stall"),
                stall_description=transaction.booking_payload.get("stall_description", ""),
                status="PENDING",
            )
            create_notification(
                request.user,
                "Stall request submitted",
                f"Your stall request '{stall.stall_name}' for '{stall.expo.title}' has been submitted.",
            )
            create_notification(
                stall.expo.organizer,
                "New stall request received",
                f"{request.user.username} requested a stall for '{stall.expo.title}'.",
            )

        return Response({
            "message": "Payment verified and stall request submitted successfully.",
            "booking_type": "STALL",
        })


class RazorpayCancelPaymentView(APIView):
    """Closes a local pending checkout when the shopper dismisses Razorpay."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        transaction_id = request.data.get("transaction_id")
        updated = Transaction.objects.filter(
            id=transaction_id,
            user=request.user,
            status="PENDING",
        ).update(status="CANCELLED")
        if not updated:
            return Response({"error": "Pending payment not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"message": "Pending payment cancelled."})


class PlatformFinancialDashboard(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):

        total_transactions = Transaction.objects.filter(status="SUCCESS")

        total_revenue = total_transactions.aggregate(
            total=Sum('amount')
        )['total'] or 0

        total_commission = total_transactions.aggregate(
            total=Sum('commission_amount')
        )['total'] or 0
        total_organizer_earnings = total_transactions.aggregate(
            total=Sum('organizer_amount')
        )['total'] or 0
        stall_revenue = total_transactions.filter(
            transaction_type="STALL"
        ).aggregate(total=Sum('amount'))['total'] or 0
        ticket_revenue = total_transactions.filter(
            transaction_type="TICKET"
        ).aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            "total_revenue": total_revenue,
            "platform_commission": total_commission,
            "organizer_earnings": total_organizer_earnings,
            "stall_revenue": stall_revenue,
            "ticket_revenue": ticket_revenue,
        })
    
class OrganizerFinancialDashboard(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request):
        organizer_expos = Expo.objects.filter(organizer=request.user)

        transactions = Transaction.objects.filter(
            expo__in=organizer_expos,
            status="SUCCESS"
        )

        total_revenue = transactions.aggregate(
            total=Sum('organizer_amount')
        )['total'] or 0

        stall_income = transactions.filter(
            transaction_type="STALL"
        ).aggregate(total=Sum('organizer_amount'))['total'] or 0

        ticket_income = transactions.filter(
            transaction_type="TICKET"
        ).aggregate(total=Sum('organizer_amount'))['total'] or 0

        return Response({
            "total_income": total_revenue,
            "stall_income": stall_income,
            "ticket_income": ticket_income,
        })
    
class ExpoRevenueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        expo = get_object_or_404(Expo, id=pk)
        if not request.user.is_staff and expo.organizer != request.user:
            raise PermissionDenied("You can only view revenue for your own expos.")

        transactions = Transaction.objects.filter(
            expo=expo,
            status="SUCCESS"
        )

        total_revenue = transactions.aggregate(
            total=Sum('amount')
        )['total'] or 0

        total_commission = transactions.aggregate(
            total=Sum('commission_amount')
        )['total'] or 0

        organizer_income = transactions.aggregate(
            total=Sum('organizer_amount')
        )['total'] or 0

        stall_revenue = transactions.filter(
            transaction_type="STALL"
        ).aggregate(total=Sum('amount'))['total'] or 0

        ticket_revenue = transactions.filter(
            transaction_type="TICKET"
        ).aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            "expo": expo.title,
            "total_revenue": total_revenue,
            "platform_commission": total_commission,
            "organizer_income": organizer_income,
            "stall_revenue": stall_revenue,
            "ticket_revenue": ticket_revenue,
        })
class MonthlyRevenueView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):

        data = (
            Transaction.objects
            .filter(status="SUCCESS")
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(revenue=Sum("amount"))
            .order_by("month")
        )

        return Response(data)


class PlatformAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        organizer_counts = {
            item["status"]: item["total"]
            for item in User.objects.filter(role="ORGANIZER")
            .values("status")
            .annotate(total=Count("id"))
        }

        expo_counts = {
            item["status"]: item["total"]
            for item in Expo.objects.values("status").annotate(total=Count("id"))
        }

        top_expos = (
            Transaction.objects
            .filter(status="SUCCESS")
            .values("expo_id", "expo__title")
            .annotate(
                revenue=Sum("amount"),
                commission=Sum("commission_amount"),
                organizer_income=Sum("organizer_amount"),
                transactions=Count("id"),
            )
            .order_by("-revenue")[:5]
        )

        top_expo_ids = [item["expo_id"] for item in top_expos]
        ticket_counts = {
            item["expo_id"]: item["total"]
            for item in Ticket.objects.filter(expo_id__in=top_expo_ids)
            .values("expo_id")
            .annotate(total=Count("id"))
        }
        stall_counts = {
            item["expo_id"]: item["total"]
            for item in StallBooking.objects.filter(expo_id__in=top_expo_ids, status="APPROVED")
            .values("expo_id")
            .annotate(total=Count("id"))
        }

        top_expo_payload = [
            {
                "expo_id": item["expo_id"],
                "title": item["expo__title"],
                "revenue": item["revenue"] or 0,
                "commission": item["commission"] or 0,
                "organizer_income": item["organizer_income"] or 0,
                "transactions": item["transactions"],
                "tickets_booked": ticket_counts.get(item["expo_id"], 0),
                "approved_stalls": stall_counts.get(item["expo_id"], 0),
            }
            for item in top_expos
        ]

        return Response({
            "organizers": {
                "pending": organizer_counts.get("PENDING", 0),
                "approved": organizer_counts.get("APPROVED", 0),
                "rejected": organizer_counts.get("REJECTED", 0),
            },
            "expos": {
                "pending": expo_counts.get("PENDING", 0),
                "approved": expo_counts.get("APPROVED", 0),
                "rejected": expo_counts.get("REJECTED", 0),
                "active": expo_counts.get("ACTIVE", 0),
                "completed": expo_counts.get("COMPLETED", 0),
            },
            "top_expos": top_expo_payload,
        })


class UserTransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).select_related("expo").order_by("-created_at")





