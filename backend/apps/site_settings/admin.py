from django.contrib import admin

from apps.core.admin_utils import TranslationInline

from .models import SiteSettings, SiteSettingsTranslation


class SiteSettingsTranslationInline(TranslationInline):
    model = SiteSettingsTranslation


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ["__str__", "company_name", "contact_email", "whatsapp_number", "updated_at"]
    inlines = [SiteSettingsTranslationInline]

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
