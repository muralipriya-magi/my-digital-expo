from django.db.models import Sum
from django.db.models import Q
from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from finance.models import Transaction
from users.notifications import create_notification, notify_admins
from .emails import send_expo_status_email, send_ticket_admin_alert
from users.permissions import IsOrganizer, IsVendor, IsVisitor

from .models import City, Expo, StallBooking, Theme, Ticket, TicketScanHistory, Venue
from .serializers import (
    ExpoApprovalSerializer,
    ExpoCreateSerializer,
    FeaturedExpoSerializer,
    ExpoListSerializer,
    OrganizerExpoSerializer,
    OrganizerStallRequestSerializer,
    StallApprovalSerializer,
    StallBookingSerializer,
    TicketSerializer,
    TicketListSerializer,
    VendorBookingListSerializer,
)


# Create your views here.
class ExpoCreateView(generics.CreateAPIView):
    queryset = Expo.objects.all()
    serializer_class = ExpoCreateSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]

    def perform_create(self, serializer):
        expo = serializer.save()
        create_notification(
            self.request.user,
            "Expo submitted for approval",
            f"Your expo '{expo.title}' has been created and sent to admin for review.",
        )
        notify_admins(
            "New expo approval request",
            f"'{expo.title}' was submitted by {self.request.user.username} and is waiting for approval.",
        )

class StallBookingCreateView(generics.CreateAPIView):
    queryset = StallBooking.objects.all()
    serializer_class = StallBookingSerializer
    permission_classes = [IsAuthenticated, IsVendor]

    def perform_create(self, serializer):
        stall = serializer.save()
        create_notification(
            self.request.user,
            "Stall request submitted",
            f"Your stall request '{stall.stall_name}' for '{stall.expo.title}' has been submitted.",
        )
        create_notification(
            stall.expo.organizer,
            "New stall request received",
            f"{self.request.user.username} requested a stall for '{stall.expo.title}'.",
        )

class StallApprovalView(generics.UpdateAPIView):
    queryset = StallBooking.objects.all()
    serializer_class = StallApprovalSerializer
    permission_classes = [IsAuthenticated]
    def perform_update(self, serializer):
        stall = self.get_object()
        user = self.request.user
        if user.role != 'ORGANIZER':
            raise PermissionDenied("Only organizer can approve stall")
        if stall.expo.organizer != user:
            raise PermissionDenied("You can only approve stalls for youe expos")
        with db_transaction.atomic():
            expo = Expo.objects.select_for_update().get(id=stall.expo_id)
            if (
                serializer.validated_data.get("status") == "APPROVED"
                and stall.status != "APPROVED"
                and StallBooking.objects.filter(expo=expo, status="APPROVED").count() >= expo.max_stalls
            ):
                raise PermissionDenied("This expo has reached its approved stall capacity.")
            updated_stall = serializer.save()
        decision = updated_stall.status.title().lower()
        create_notification(
            updated_stall.vendor,
            f"Stall request {decision}",
            f"Your stall request '{updated_stall.stall_name}' for '{updated_stall.expo.title}' was {decision}.",
        )

class ExpoApprovalView(generics.UpdateAPIView):
    queryset = Expo.objects.all()
    serializer_class = ExpoApprovalSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def perform_update(self, serializer):
        previous_status = serializer.instance.status
        previous_is_featured = serializer.instance.is_featured
        expo = serializer.save()

        if expo.status != previous_status:
            status_text = expo.status.title().lower()
            create_notification(
                expo.organizer,
                f"Expo {status_text}",
                f"Your expo '{expo.title}' has been {status_text} by the admin team.",
            )
            send_expo_status_email(expo)

        if expo.is_featured and not previous_is_featured:
            create_notification(
                expo.organizer,
                "Expo featured on landing page",
                f"Your expo '{expo.title}' is now featured on the public website.",
            )

class TicketBookingView(generics.CreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated, IsVisitor]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        expo = booking["expo"]
        adult_count = booking["adult_count"]
        child_count = booking["child_count"]

        create_notification(
            self.request.user,
            "Ticket booked successfully",
            f"Your booking for '{expo.title}' is confirmed with {adult_count} adult and {child_count} child tickets.",
        )
        create_notification(
            expo.organizer,
            "New visitor ticket booked",
            f"A visitor booked {adult_count + child_count} tickets for '{expo.title}'.",
        )
        send_ticket_admin_alert(expo, self.request.user, adult_count, child_count, booking["total_amount"])
        return Response({
            "message": "Tickets booked successfully.",
            "adult_count": adult_count,
            "child_count": child_count,
            "total_amount": booking["total_amount"],
        }, status=status.HTTP_201_CREATED)

class ExpoListView(generics.ListAPIView):
    serializer_class = ExpoListSerializer

    def get_queryset(self):
        queryset = Expo.objects.filter(status__in=['APPROVED', 'ACTIVE']).order_by("-created_at")
        theme_id = self.request.query_params.get('theme')
        city_id = self.request.query_params.get('city')
        search = self.request.query_params.get('search')
        if theme_id:
            queryset = queryset.filter(theme_id=theme_id)
        if city_id:
            queryset = queryset.filter(city_id=city_id)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(theme__name__icontains=search) |
                Q(city__name__icontains=search) |
                Q(venue__name__icontains=search)
            )
        return queryset


class FeaturedExpoView(generics.RetrieveAPIView):
    serializer_class = FeaturedExpoSerializer

    def get_object(self):
        queryset = Expo.objects.filter(status__in=["APPROVED", "ACTIVE"]).order_by("-created_at")
        featured = queryset.filter(is_featured=True).first()
        return featured or queryset.first()


class ExpoDetailView(generics.RetrieveAPIView):
    serializer_class = ExpoListSerializer
    queryset = Expo.objects.filter(status__in=["APPROVED", "ACTIVE"])


class OrganizerExpoListView(generics.ListAPIView):
    serializer_class = OrganizerExpoSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get_queryset(self):
        return Expo.objects.filter(organizer=self.request.user).order_by("-created_at")


class ExpoMetadataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        city_id = request.query_params.get("city")
        venues = Venue.objects.all()
        if city_id:
            venues = venues.filter(city_id=city_id)

        return Response({
            "themes": [
                {
                    "id": theme.id,
                    "name": theme.name,
                    "image": request.build_absolute_uri(theme.image.url) if theme.image else None,
                }
                for theme in Theme.objects.order_by("name")
            ],
            "cities": [{"id": city.id, "name": city.name} for city in City.objects.order_by("name")],
            "venues": [
                {"id": venue.id, "name": venue.name, "city_id": venue.city_id}
                for venue in venues.order_by("name")
            ],
        })


class VendorBookingListView(generics.ListAPIView):
    serializer_class = VendorBookingListSerializer
    permission_classes = [IsAuthenticated, IsVendor]

    def get_queryset(self):
        return StallBooking.objects.filter(vendor=self.request.user).select_related("expo", "expo__city", "expo__venue")


class OrganizerStallRequestListView(generics.ListAPIView):
    serializer_class = OrganizerStallRequestSerializer
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get_queryset(self):
        return StallBooking.objects.filter(expo__organizer=self.request.user).select_related("expo", "vendor").order_by("status", "-id")


class PendingExpoListView(generics.ListAPIView):
    serializer_class = OrganizerExpoSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return Expo.objects.filter(status="PENDING").select_related("theme", "city", "venue", "organizer").order_by("-created_at")


class VisitorTicketListView(generics.ListAPIView):
    serializer_class = TicketListSerializer
    permission_classes = [IsAuthenticated, IsVisitor]

    def get_queryset(self):
        return Ticket.objects.filter(visitor=self.request.user).select_related("expo").order_by("-booking_date")

class VerifyTicketView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def post(self, request):

        code = request.data.get("ticket_code")
        gate = request.data.get("gate_name", "Main Gate")

        try:
            ticket = Ticket.objects.get(ticket_code=code)

            if ticket.expo.organizer != request.user:
                return Response(
                    {"message": "You can only verify tickets for your own expos."},
                    status=status.HTTP_403_FORBIDDEN
                )

            if ticket.qr_verified:
                return Response(
                    {"message": "Ticket already used."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            ticket.qr_verified = True
            ticket.save()

            TicketScanHistory.objects.create(
                ticket=ticket,
                scanned_by=request.user,
                gate_name=gate
            )

            create_notification(
                ticket.visitor,
                "Ticket used for entry",
                f"Your ticket for '{ticket.expo.title}' was scanned successfully at {gate}.",
            )

            return Response({
                "message": "Entry allowed.",
                "visitor": ticket.visitor.username,
                "expo": ticket.expo.title
            })

        except Ticket.DoesNotExist:

            return Response(
                {"message": "Invalid ticket."},
                status=status.HTTP_404_NOT_FOUND
            )

class ExpoStatsView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request, pk):
        expo = get_object_or_404(Expo, id=pk)
        if expo.organizer != request.user:
            raise PermissionDenied("You can only view stats for your own expos.")
        total_tickets = Ticket.objects.filter(expo=expo).count()
        verified_tickets = Ticket.objects.filter(expo=expo, qr_verified=True).count()
        total_stalls = StallBooking.objects.filter(expo=expo).count()
        approved_stalls = StallBooking.objects.filter(expo=expo, status="APPROVED").count()

        return Response({
            "max_visitors": expo.max_visitors,
            "tickets_booked": total_tickets,
            "tickets_verified": verified_tickets,
            "tickets_remaining": expo.max_visitors - total_tickets,
            "max_stalls": expo.max_stalls,
            "stalls_booked": total_stalls,
            "stalls_approved": approved_stalls,
        })
    
class OrganizerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]
    def get(self, request):
        expos = Expo.objects.filter(organizer=request.user)
        total_expos = expos.count()
        total_stalls = StallBooking.objects.filter(
            expo__in=expos
        ).count()

        approved_stalls = StallBooking.objects.filter(
            expo__in=expos,
            status="APPROVED"
        ).count()

        total_tickets = Ticket.objects.filter(
            expo__in=expos
        ).count()

        revenue = Transaction.objects.filter(
            expo__in=expos,
            status="SUCCESS"
        ).aggregate(total=Sum("organizer_amount"))["total"] or 0

        return Response({
            "total_expos": total_expos,
            "total_stalls": total_stalls,
            "approved_stalls": approved_stalls,
            "total_tickets": total_tickets,
            "total_revenue": revenue
        })
class VendorDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsVendor]

    def get(self, request):

        vendor = request.user

        total_stalls = StallBooking.objects.filter(
            vendor=vendor
        ).count()

        approved_stalls = StallBooking.objects.filter(
            vendor=vendor,
            status="APPROVED"
        ).count()

        pending_stalls = StallBooking.objects.filter(
            vendor=vendor,
            status="PENDING"
        ).count()

        rejected_stalls = StallBooking.objects.filter(
            vendor=vendor,
            status="REJECTED"
        ).count()

        return Response({
            "vendor": vendor.username,
            "total_stalls": total_stalls,
            "approved_stalls": approved_stalls,
            "pending_stalls": pending_stalls,
            "rejected_stalls": rejected_stalls,
        })
class ScanHistoryView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request, expo_id):
        expo = get_object_or_404(Expo, id=expo_id)
        if expo.organizer != request.user:
            raise PermissionDenied("You can only view scan history for your own expos.")

        scans = TicketScanHistory.objects.filter(
            ticket__expo_id=expo_id
        ).select_related("ticket", "ticket__visitor")
        data = [
            {
                "visitor": s.ticket.visitor.username,
                "ticket_code": str(s.ticket.ticket_code),
                "gate": s.gate_name,
                "time": s.scanned_at
            }
            for s in scans
        ]
        return Response(data)
    
class ExpoEntryCounter(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request, expo_id):
        expo = get_object_or_404(Expo, id=expo_id)
        if expo.organizer != request.user:
            raise PermissionDenied("You can only view entry counts for your own expos.")

        entered = Ticket.objects.filter(
            expo_id=expo_id,
            qr_verified=True
        ).count()
        return Response({
            "entered_visitors": entered
        })
