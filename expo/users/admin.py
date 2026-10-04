from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Register your models here.
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username','email','role','status','phone_number','company_name','is_staff')
    list_filter = ('role','status','is_staff', 'city')

admin.site.register(User, CustomUserAdmin)
