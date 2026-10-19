from __future__ import annotations

from django.db import models, transaction

from apps.core.languages import DEFAULT_LANGUAGE, Language
from apps.core.models import TimeStampedModel


class InquiryStatus(models.TextChoices):
    NEW = "new", "New"
    IN_PROGRESS = "in_progress", "In progress"
    COMPLETED = "completed", "Completed"
    ARCHIVED = "archived", "Archived"


class Budget(models.TextChoices):
    NONE = "", "Not specified"
    UNDER_1K = "under_1k", "Under $1k"
    FROM_1K_TO_5K = "1k_5k", "$1k – $5k"
    FROM_5K_TO_15K = "5k_15k", "$5k – $15k"
    OVER_15K = "15k_plus", "$15k+"
    NOT_SURE = "not_sure", "Not sure yet"


OTHER_SERVICE = "other"


class ProjectInquiry(TimeStampedModel):
    reference = models.CharField(max_length=20, unique=True, null=True, blank=True, editable=False)
    name = models.CharField(max_length=120)
    email = models.EmailField(max_length=254)
    company = models.CharField(max_length=160, blank=True)
    service = models.CharField(
        max_length=60, blank=True, help_text="Service key at submission time, 'other' or empty."
    )
    budget = models.CharField(max_length=10, choices=Budget.choices, blank=True, default=Budget.NONE)
    description = models.TextField()
    preferred_language = models.CharField(max_length=2, choices=Language.choices, default=DEFAULT_LANGUAGE)
    consent = models.BooleanField(default=False)
    status = models.CharField(
        max_length=12, choices=InquiryStatus.choices, default=InquiryStatus.NEW, db_index=True
    )
    internal_notes = models.TextField(blank=True)
    # Privacy: only a keyed hash of the client IP is stored (abuse correlation),
    # never the address itself.
    ip_hash = models.CharField(max_length=64, blank=True, editable=False)
    user_agent = models.CharField(max_length=255, blank=True, editable=False)
    notification_sent_at = models.DateTimeField(null=True, blank=True, editable=False)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "project inquiry"
        verbose_name_plural = "project inquiries"
        indexes = [models.Index(fields=["status", "-created_at"], name="inquiry_status_created_idx")]

    def __str__(self) -> str:
        return self.reference or f"Inquiry #{self.pk}"

    @staticmethod
    def build_reference(year: int, pk: int) -> str:
        return f"INQ-{year}-{pk:06d}"

    def save(self, *args, **kwargs):
        if self.pk is not None:
            return super().save(*args, **kwargs)
        with transaction.atomic():
            super().save(*args, **kwargs)
            self.reference = self.build_reference(self.created_at.year, self.pk)
            super().save(update_fields=["reference"])
