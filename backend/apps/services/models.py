from __future__ import annotations

from django.core.validators import validate_slug
from django.db import models

from apps.core.models import PublicationStatus, TimeStampedModel, TranslationModel
from apps.core.validators import StringListValidator, validate_process_steps


class ServiceIcon(models.TextChoices):
    """Lucide icon names the frontend knows how to render."""

    GLOBE = "globe", "Globe"
    SMARTPHONE = "smartphone", "Smartphone"
    MONITOR = "monitor", "Monitor"
    WRENCH = "wrench", "Wrench"
    SERVER = "server", "Server"
    CODE = "code", "Code"
    LAYERS = "layers", "Layers"
    SHIELD = "shield", "Shield"


class ServiceQuerySet(models.QuerySet):
    def published(self):
        return self.filter(status=PublicationStatus.PUBLISHED)

    def visible_in(self, lang: str):
        """Published services with a published translation in ``lang``."""
        return self.published().filter(
            translations__language=lang, translations__status=PublicationStatus.PUBLISHED
        )


class Service(TimeStampedModel):
    key = models.SlugField(
        max_length=60,
        unique=True,
        validators=[validate_slug],
        help_text="Stable, language-independent identifier, e.g. website-development.",
    )
    icon = models.CharField(max_length=20, choices=ServiceIcon.choices, default=ServiceIcon.CODE)
    status = models.CharField(
        max_length=10, choices=PublicationStatus.choices, default=PublicationStatus.DRAFT, db_index=True
    )
    is_featured = models.BooleanField(default=False, db_index=True)
    sort_order = models.PositiveIntegerField(default=0, db_index=True)

    objects = ServiceQuerySet.as_manager()

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self) -> str:
        return self.key


class ServiceTranslation(TranslationModel):
    REQUIRED_FIELDS = ("title", "slug", "summary", "description")
    SLUG_SOURCE_FIELD = "title"

    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="translations")
    title = models.CharField(max_length=160, blank=True)
    slug = models.SlugField(max_length=180, allow_unicode=True, blank=True)
    summary = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True, help_text="Markdown.")
    capabilities = models.JSONField(
        default=list, blank=True, validators=[StringListValidator()], help_text="List of strings."
    )
    use_cases = models.JSONField(
        default=list, blank=True, validators=[StringListValidator()], help_text="List of strings."
    )
    process = models.JSONField(
        default=list,
        blank=True,
        validators=[validate_process_steps],
        help_text='List of {"title", "description"}.',
    )
    seo_title = models.CharField(max_length=160, blank=True)
    seo_description = models.CharField(max_length=320, blank=True)
    status = models.CharField(
        max_length=10, choices=PublicationStatus.choices, default=PublicationStatus.DRAFT, db_index=True
    )

    class Meta:
        ordering = ["service_id", "language"]
        constraints = [
            models.UniqueConstraint(fields=["service", "language"], name="uniq_service_translation_language"),
            models.UniqueConstraint(fields=["language", "slug"], name="uniq_service_translation_slug"),
        ]
        indexes = [models.Index(fields=["language", "status"], name="service_tr_lang_status_idx")]

    def __str__(self) -> str:
        return f"{self.service_id}:{self.language} {self.title}"
