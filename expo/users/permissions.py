from rest_framework.permissions import BasePermission

class IsOrganizer(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'ORGANIZER' and
            request.user.status == 'APPROVED'
        )
    
class IsVendor(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "VENDOR" and
            request.user.status == "APPROVED"
        )
    
class IsVisitor(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'VISITOR' and
            request.user.status == 'APPROVED'
        )
