from django.contrib import admin

from apps.core.admin_utils import TranslationInline

from .models import SiteAppearance, SiteSettings, SiteSettingsTranslation


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


@admin.register(SiteAppearance)
class SiteAppearanceAdmin(admin.ModelAdmin):
    """Read-only here: the configuration is validated and edited in the dashboard (Appearance)."""

    list_display = ["__str__", "updated_at"]
    readonly_fields = ["config", "updated_at"]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
