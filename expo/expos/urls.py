from django.urls import path
from .views import ExpoCreateView, StallApprovalView, ExpoApprovalView
from .views import ExpoListView, VerifyTicketView,ExpoStatsView,OrganizerDashboardView,VendorDashboardView
from .views import ScanHistoryView,ExpoEntryCounter
from .views import ExpoMetadataView, OrganizerExpoListView, OrganizerStallRequestListView, PendingExpoListView, VendorBookingListView, VisitorTicketListView, FeaturedExpoView, ExpoDetailView
urlpatterns = [
    path('create/', ExpoCreateView.as_view(), name='create_expo'),
    path('metadata/', ExpoMetadataView.as_view(), name='expo-metadata'),
    path('organizer-expos/', OrganizerExpoListView.as_view(), name='organizer-expo-list'),
    path('vendor-bookings/', VendorBookingListView.as_view(), name='vendor-bookings'),
    path('my-tickets/', VisitorTicketListView.as_view(), name='my-tickets'),
    path('stall-requests/', OrganizerStallRequestListView.as_view(), name='stall-requests'),
    path('pending-expos/', PendingExpoListView.as_view(), name='pending-expos'),
    path('stall-approve/<int:pk>/', StallApprovalView.as_view(), name='stall-approve'),
    path('expo-approve/<int:pk>/', ExpoApprovalView.as_view(), name='expo-approve'),
    path('list/', ExpoListView.as_view(), name='expo-list'),
    path('featured/', FeaturedExpoView.as_view(), name='featured-expo'),
    path('detail/<int:pk>/', ExpoDetailView.as_view(), name='expo-detail'),
    path('verify-ticket/', VerifyTicketView.as_view(), name='verify-ticket'),
    path('expo-stats/<int:pk>/', ExpoStatsView.as_view(), name='expo-stats'),
    path("organizer-dashboard/", OrganizerDashboardView.as_view(), name='organizer dashboard'),
    path("vendor-dashboard/", VendorDashboardView.as_view(),  name='vendeor dashboard'),
    path("scan-history/<int:expo_id>/", ScanHistoryView.as_view(),name='scan history'),
    path("entry-counter/<int:expo_id>/", ExpoEntryCounter.as_view(), name='expo entrycounter'),
    
]
    
