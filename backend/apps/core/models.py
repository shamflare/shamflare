"""Abstract base models shared by every content app."""

from __future__ import annotations

from django.core.exceptions import ValidationError
from django.db import models

from .languages import Language
from .slugs import unique_slug


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class PublicationStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"


class TranslationStatus(models.TextChoices):
    """Computed (never stored) completeness state of one translation."""

    PUBLISHED = "published", "Published"
    DRAFT = "draft", "Draft"
    INCOMPLETE = "incomplete", "Incomplete"
    MISSING = "missing", "Missing"


class TranslationModel(TimeStampedModel):
    """Base for ``<Entity>Translation`` tables.

    Concrete subclasses add a ForeignKey to their parent with
    ``related_name="translations"`` plus their localized fields, and declare:

    * ``REQUIRED_FIELDS``: fields that must be non-empty for the translation to
      count as complete (and to be published).
    * ``SLUG_SOURCE_FIELD``: field used to auto-generate ``slug`` (or ``None``
      when the table has no slug).
    * ``HAS_STATUS``: whether the translation carries its own draft/published
      status. Tables without status count as "published" once complete.
    """

    REQUIRED_FIELDS: tuple[str, ...] = ()
    SLUG_SOURCE_FIELD: str | None = None
    HAS_STATUS: bool = True

    language = models.CharField(max_length=2, choices=Language.choices, db_index=True)

    class Meta:
        abstract = True

    @classmethod
    def publish_required_fields(cls) -> tuple[str, ...]:
        # Slugs are always auto-generated, so they never block publishing.
        return tuple(f for f in cls.REQUIRED_FIELDS if f != "slug")

    def missing_required_fields(self) -> list[str]:
        return [f for f in self.REQUIRED_FIELDS if not getattr(self, f, None)]

    def clean(self):
        super().clean()
        if self.HAS_STATUS and getattr(self, "status", None) == PublicationStatus.PUBLISHED:
            errors = {
                f: "This field is required to publish this translation."
                for f in self.publish_required_fields()
                if not getattr(self, f, None)
            }
            if errors:
                raise ValidationError(errors)

    def save(self, *args, **kwargs):
        if self.SLUG_SOURCE_FIELD and not getattr(self, "slug", ""):
            max_length = self._meta.get_field("slug").max_length
            self.slug = unique_slug(
                type(self),
                self.language,
                getattr(self, self.SLUG_SOURCE_FIELD, ""),
                exclude_pk=self.pk,
                max_length=max_length,
            )
        super().save(*args, **kwargs)
