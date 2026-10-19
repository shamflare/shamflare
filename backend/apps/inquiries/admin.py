from django.contrib import admin

from .models import ProjectInquiry


@admin.register(ProjectInquiry)
class ProjectInquiryAdmin(admin.ModelAdmin):
    list_display = ["reference", "name", "email", "company", "service", "status", "created_at"]
    list_filter = ["status", "service", "preferred_language", "created_at"]
    search_fields = ["reference", "name", "email", "company", "description"]
    readonly_fields = [
        "reference",
        "name",
        "email",
        "company",
        "service",
        "budget",
        "description",
        "preferred_language",
        "consent",
        "notification_sent_at",
        "created_at",
        "updated_at",
    ]
    fields = readonly_fields[:9] + ["status", "internal_notes"] + readonly_fields[9:]
    date_hierarchy = "created_at"

    def has_add_permission(self, request):
        return False  # inquiries come only from the public form
