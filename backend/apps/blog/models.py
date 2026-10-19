from __future__ import annotations

import math
import re

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.core.models import PublicationStatus, TimeStampedModel, TranslationModel
from apps.core.uploads import UploadTo

DEFAULT_AUTHOR_NAME = "Shamflare Team"
WORDS_PER_MINUTE = 200
_WORD_RE = re.compile(r"\w+", re.UNICODE)


def reading_time_minutes(text: str) -> int:
    words = len(_WORD_RE.findall(text or ""))
    return max(1, math.ceil(words / WORDS_PER_MINUTE))


class BlogCategory(TimeStampedModel):
    sort_order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name_plural = "blog categories"

    def __str__(self) -> str:
        return f"Category #{self.pk}"


class BlogCategoryTranslation(TranslationModel):
    """Categories have no own status: visible in a locale once translated."""

    REQUIRED_FIELDS = ("name", "slug")
    SLUG_SOURCE_FIELD = "name"
    HAS_STATUS = False

    category = models.ForeignKey(BlogCategory, on_delete=models.CASCADE, related_name="translations")
    name = models.CharField(max_length=100, blank=True)
    slug = models.SlugField(max_length=120, allow_unicode=True, blank=True)

    class Meta:
        ordering = ["category_id", "language"]
        constraints = [
            models.UniqueConstraint(fields=["category", "language"], name="uniq_category_translation_language"),
            models.UniqueConstraint(fields=["language", "slug"], name="uniq_category_translation_slug"),
        ]

    def __str__(self) -> str:
        return f"{self.category_id}:{self.language} {self.name}"


class BlogPostQuerySet(models.QuerySet):
    def published(self):
        return self.filter(status=PublicationStatus.PUBLISHED, published_at__lte=timezone.now())

    def visible_in(self, lang: str):
        return self.published().filter(
            translations__language=lang, translations__status=PublicationStatus.PUBLISHED
        )


class BlogPost(TimeStampedModel):
    category = models.ForeignKey(
        BlogCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="posts"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="blog_posts"
    )
    status = models.CharField(
        max_length=10, choices=PublicationStatus.choices, default=PublicationStatus.DRAFT, db_index=True
    )
    published_at = models.DateTimeField(
        null=True, blank=True, db_index=True, help_text="Set automatically on first publish if empty."
    )
    cover_image = models.ImageField(upload_to=UploadTo("blog/covers"), blank=True, max_length=255)

    objects = BlogPostQuerySet.as_manager()

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def __str__(self) -> str:
        return f"Post #{self.pk}"

    @property
    def author_name(self) -> str:
        if self.author_id and self.author:
            full_name = self.author.get_full_name().strip()
            if full_name:
                return full_name
        return DEFAULT_AUTHOR_NAME

    def save(self, *args, **kwargs):
        if self.status == PublicationStatus.PUBLISHED and self.published_at is None:
            self.published_at = timezone.now()
            if kwargs.get("update_fields") is not None:
                kwargs["update_fields"] = {*kwargs["update_fields"], "published_at"}
        super().save(*args, **kwargs)


class BlogPostTranslation(TranslationModel):
    REQUIRED_FIELDS = ("title", "slug", "excerpt", "body")
    SLUG_SOURCE_FIELD = "title"

    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name="translations")
    title = models.CharField(max_length=200, blank=True)
    slug = models.SlugField(max_length=220, allow_unicode=True, blank=True)
    excerpt = models.CharField(max_length=500, blank=True)
    body = models.TextField(blank=True, help_text="Markdown.")
    cover_alt = models.CharField(max_length=200, blank=True)
    seo_title = models.CharField(max_length=160, blank=True)
    seo_description = models.CharField(max_length=320, blank=True)
    status = models.CharField(
        max_length=10, choices=PublicationStatus.choices, default=PublicationStatus.DRAFT, db_index=True
    )

    class Meta:
        ordering = ["post_id", "language"]
        constraints = [
            models.UniqueConstraint(fields=["post", "language"], name="uniq_post_translation_language"),
            models.UniqueConstraint(fields=["language", "slug"], name="uniq_post_translation_slug"),
        ]
        indexes = [models.Index(fields=["language", "status"], name="post_tr_lang_status_idx")]

    def __str__(self) -> str:
        return f"{self.post_id}:{self.language} {self.title}"

    @property
    def reading_time_minutes(self) -> int:
        return reading_time_minutes(self.body)
