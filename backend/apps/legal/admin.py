from django.contrib import admin

from apps.core.admin_utils import TranslationInline

from .models import LegalDocument, LegalDocumentTranslation


class LegalDocumentTranslationInline(TranslationInline):
    model = LegalDocumentTranslation


@admin.register(LegalDocument)
class LegalDocumentAdmin(admin.ModelAdmin):
    list_display = ["__str__", "content_updated_at", "updated_at"]
    readonly_fields = ["kind", "content_updated_at"]
    inlines = [LegalDocumentTranslationInline]

    def has_add_permission(self, request):
        return False  # the two documents are created on first use

    def has_delete_permission(self, request, obj=None):
        return False
