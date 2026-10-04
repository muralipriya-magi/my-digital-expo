from django.urls import path
from .views import (
    ExpoRevenueView,
    MonthlyRevenueView,
    OrganizerFinancialDashboard,
    PlatformFinancialDashboard,
    PlatformAnalyticsView,
    RazorpayCreateOrderView,
    RazorpayCancelPaymentView,
    RazorpayVerifyPaymentView,
    UserTransactionListView,
)

urlpatterns = [
    path('financial-dashboard/', PlatformFinancialDashboard.as_view(), name='financial-dashboard'),
    path('platform-analytics/', PlatformAnalyticsView.as_view(), name='platform-analytics'),
    path('organizer-financial/', OrganizerFinancialDashboard.as_view(), name='organizer-financial'),
    path('expo-revenue/<int:pk>/', ExpoRevenueView.as_view(), name='expo-revenue'),
    path("monthly-revenue/", MonthlyRevenueView.as_view()),
    path("my-transactions/", UserTransactionListView.as_view(), name="my-transactions"),
    path("razorpay/create-order/", RazorpayCreateOrderView.as_view(), name="razorpay-create-order"),
    path("razorpay/verify/", RazorpayVerifyPaymentView.as_view(), name="razorpay-verify"),
    path("razorpay/cancel/", RazorpayCancelPaymentView.as_view(), name="razorpay-cancel"),
]
