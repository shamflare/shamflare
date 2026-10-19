from django.contrib import admin

from apps.core.admin_utils import TranslationInline, TranslationStatusMixin

from .models import Service, ServiceTranslation


class ServiceTranslationInline(TranslationInline):
    model = ServiceTranslation


@admin.register(Service)
class ServiceAdmin(TranslationStatusMixin, admin.ModelAdmin):
    list_display = ["key", "icon", "status", "is_featured", "sort_order", "translation_summary", "updated_at"]
    list_filter = ["status", "is_featured"]
    list_editable = ["sort_order"]
    search_fields = ["key", "translations__title"]
    inlines = [ServiceTranslationInline]
