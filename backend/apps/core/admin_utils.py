"""Shared Django admin helpers (the fallback operations UI at /django-admin/)."""

from django.contrib import admin

from .languages import LANGUAGE_CODES
from .translations import compute_translation_status


class TranslationInline(admin.StackedInline):
    extra = 0
    max_num = len(LANGUAGE_CODES)
    show_change_link = False


class TranslationStatusMixin:
    @admin.display(description="Translations")
    def translation_summary(self, obj):
        return ", ".join(f"{lang}: {state}" for lang, state in compute_translation_status(obj).items())

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("translations")
