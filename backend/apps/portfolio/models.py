from __future__ import annotations

from django.db import models

from apps.core.models import PublicationStatus, TimeStampedModel, TranslationModel
from apps.core.uploads import UploadTo
from apps.core.validators import StringListValidator
from apps.services.models import Service


class PortfolioProjectQuerySet(models.QuerySet):
    def published(self):
        return self.filter(status=PublicationStatus.PUBLISHED)

    def visible_in(self, lang: str):
        return self.published().filter(
            translations__language=lang, translations__status=PublicationStatus.PUBLISHED
        )


class PortfolioProject(TimeStampedModel):
    category = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="primary_projects",
        help_text="Primary service shown as the project's category.",
    )
    services = models.ManyToManyField(Service, blank=True, related_name="projects")
    technologies = models.JSONField(
        default=list, blank=True, validators=[StringListValidator(max_length=60)], help_text="List of strings."
    )
    external_url = models.URLField(max_length=500, blank=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    is_demo = models.BooleanField(
        default=False, help_text="Demonstration project, not commissioned client work."
    )
    status = models.CharField(
        max_length=10, choices=PublicationStatus.choices, default=PublicationStatus.DRAFT, db_index=True
    )
    sort_order = models.PositiveIntegerField(default=0, db_index=True)
    cover_image = models.ImageField(upload_to=UploadTo("portfolio/covers"), blank=True, max_length=255)

    objects = PortfolioProjectQuerySet.as_manager()

    class Meta:
        ordering = ["sort_order", "-created_at"]

    def __str__(self) -> str:
        return f"Project #{self.pk}"


class PortfolioProjectTranslation(TranslationModel):
    REQUIRED_FIELDS = ("title", "slug", "summary", "body")
    SLUG_SOURCE_FIELD = "title"

    project = models.ForeignKey(PortfolioProject, on_delete=models.CASCADE, related_name="translations")
    title = models.CharField(max_length=160, blank=True)
    slug = models.SlugField(max_length=180, allow_unicode=True, blank=True)
    summary = models.CharField(max_length=500, blank=True)
    body = models.TextField(blank=True, help_text="Markdown.")
    cover_alt = models.CharField(max_length=200, blank=True)
    seo_title = models.CharField(max_length=160, blank=True)
    seo_description = models.CharField(max_length=320, blank=True)
    status = models.CharField(
        max_length=10, choices=PublicationStatus.choices, default=PublicationStatus.DRAFT, db_index=True
    )

    class Meta:
        ordering = ["project_id", "language"]
        constraints = [
            models.UniqueConstraint(fields=["project", "language"], name="uniq_project_translation_language"),
            models.UniqueConstraint(fields=["language", "slug"], name="uniq_project_translation_slug"),
        ]
        indexes = [models.Index(fields=["language", "status"], name="project_tr_lang_status_idx")]

    def __str__(self) -> str:
        return f"{self.project_id}:{self.language} {self.title}"


class PortfolioImage(TimeStampedModel):
    project = models.ForeignKey(PortfolioProject, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to=UploadTo("portfolio/gallery"), max_length=255)
    alt_text = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self) -> str:
        return f"Image #{self.pk} of project #{self.project_id}"
