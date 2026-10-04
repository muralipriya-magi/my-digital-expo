from django.urls import path
from .views import (
    ContactMessageView,
    CustomLoginView,
    NotificationListView,
    NotificationMarkAllReadView,
    OrganizerApprovalView,
    OrganizerListView,
    SignUpView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/',SignUpView.as_view(), name='signup'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('refresh/',TokenRefreshView.as_view(), name='token_refresh'),
    path('organizers/', OrganizerListView.as_view(), name='organizer-list'),
    path('organizer-approve/<int:pk>/',OrganizerApprovalView.as_view(), name='organizer-approve'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/mark-all-read/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read'),
    path('contact/', ContactMessageView.as_view(), name='contact-message'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
