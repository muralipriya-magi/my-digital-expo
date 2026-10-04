from django.contrib import admin
from django.utils.html import format_html
from .models import City, Venue, Theme, ThemeFeature, Expo, ExpoReminder, StallBooking

# Register your models here.
@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'capacity')
    list_filter = ('name',)
    search_fields = ('name',)

class ThemeFeatureInline(admin.TabularInline):
    model = ThemeFeature
    extra = 1

@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'default_duration_days', 'image', 'image_preview')
    fields = ('name', 'description', 'default_duration_days', 'image', 'image_preview')
    readonly_fields = ('image_preview',)
    inlines = [ThemeFeatureInline]

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" alt="{}" style="max-height: 120px; border-radius: 8px;" />',
                obj.image.url,
                obj.name,
            )
        return "No image"

    image_preview.short_description = "Preview"

@admin.register(Expo)
class ExpoAdmin(admin.ModelAdmin):
    list_display = ('title', 'organizer', 'city', 'venue', 'status', 'is_featured', 'start_date', 'end_date')
    list_filter = ('status', 'city', 'theme', 'is_featured')
    search_fields = ('title',)

@admin.register(StallBooking)
class StallBookingAdmin(admin.ModelAdmin):
    list_display = ('stall_name', 'vendor', 'expo', 'status')
    list_filter = ('status', 'expo')


@admin.register(ExpoReminder)
class ExpoReminderAdmin(admin.ModelAdmin):
    list_display = ('expo', 'user', 'reminder_type', 'sent_at')
    list_filter = ('reminder_type',)
    search_fields = ('expo__title', 'user__email', 'user__username')
    readonly_fields = ('expo', 'user', 'reminder_type', 'sent_at')
    
