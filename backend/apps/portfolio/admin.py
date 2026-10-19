from django.contrib import admin

from apps.core.admin_utils import TranslationInline, TranslationStatusMixin

from .models import PortfolioImage, PortfolioProject, PortfolioProjectTranslation


class ProjectTranslationInline(TranslationInline):
    model = PortfolioProjectTranslation


class PortfolioImageInline(admin.TabularInline):
    model = PortfolioImage
    extra = 0
    fields = ["image", "alt_text", "sort_order"]


@admin.register(PortfolioProject)
class PortfolioProjectAdmin(TranslationStatusMixin, admin.ModelAdmin):
    list_display = ["__str__", "category", "status", "is_featured", "is_demo", "sort_order", "translation_summary"]
    list_filter = ["status", "is_featured", "is_demo", "category"]
    search_fields = ["translations__title"]
    filter_horizontal = ["services"]
    inlines = [ProjectTranslationInline, PortfolioImageInline]
