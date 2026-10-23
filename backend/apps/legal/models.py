from __future__ import annotations

from django.db import models

from apps.core.models import TimeStampedModel, TranslationModel


class LegalDocumentKind(models.TextChoices):
    PRIVACY = "privacy", "Privacy Policy"
    TERMS = "terms", "Terms of Use"


class LegalDocument(TimeStampedModel):
    """One row per kind (privacy, terms), edited from the dashboard.

    A language without text falls back to the built-in document shipped with the
    frontend, so the public pages are never empty.
    """

    kind = models.CharField(max_length=20, choices=LegalDocumentKind.choices, unique=True)
    # The public "Last updated" date. Unlike ``updated_at`` it only moves when
    # the text of a translation actually changes, not on every save.
    content_updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["kind"]

    def __str__(self) -> str:
        return self.get_kind_display()

    @classmethod
    def load(cls, kind: str) -> LegalDocument:
        obj, _ = cls.objects.get_or_create(kind=kind)
        return obj


class LegalDocumentTranslation(TranslationModel):
    REQUIRED_FIELDS = ("body",)
    HAS_STATUS = False

    document = models.ForeignKey(LegalDocument, on_delete=models.CASCADE, related_name="translations")
    body = models.TextField(blank=True, help_text="Markdown.")

    class Meta:
        ordering = ["language"]
        constraints = [
            models.UniqueConstraint(fields=["document", "language"], name="uniq_legal_document_language"),
        ]

    def __str__(self) -> str:
        return f"{self.document} ({self.language})"
