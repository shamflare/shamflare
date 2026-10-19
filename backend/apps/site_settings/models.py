from __future__ import annotations

from urllib.parse import quote

from django.core.validators import RegexValidator
from django.db import models

from apps.core.models import TimeStampedModel, TranslationModel
from apps.core.validators import validate_social_links

whatsapp_number_validator = RegexValidator(
    r"^\d{8,15}$", "Enter the international number as 8–15 digits, without + or spaces."
)


class SiteSettings(TimeStampedModel):
    """Singleton (pk is always 1) holding company-wide configurable content."""

    SINGLETON_PK = 1

    company_name = models.CharField(max_length=120, default="Shamflare")
    contact_email = models.EmailField(blank=True)
    whatsapp_number = models.CharField(max_length=15, blank=True, validators=[whatsapp_number_validator])
    social_links = models.JSONField(
        default=list, blank=True, validators=[validate_social_links], help_text='List of {"label", "url"}.'
    )

    class Meta:
        verbose_name = "site settings"
        verbose_name_plural = "site settings"

    def __str__(self) -> str:
        return "Site settings"

    def save(self, *args, **kwargs):
        self.pk = self.SINGLETON_PK
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):  # the singleton is never deleted
        return 0, {}

    @classmethod
    def load(cls) -> SiteSettings:
        obj, _ = cls.objects.get_or_create(pk=cls.SINGLETON_PK)
        return obj

    def whatsapp_url(self, message: str = "") -> str:
        if not self.whatsapp_number:
            return ""
        url = f"https://wa.me/{self.whatsapp_number}"
        if message:
            url += "?text=" + quote(message, safe="")
        return url


class SiteSettingsTranslation(TranslationModel):
    """Localized site copy. No own status: empty fields fall back to frontend defaults."""

    REQUIRED_FIELDS = ("tagline", "hero_title", "hero_subtitle")
    HAS_STATUS = False

    settings = models.ForeignKey(SiteSettings, on_delete=models.CASCADE, related_name="translations")
    tagline = models.CharField(max_length=200, blank=True)
    hero_title = models.CharField(max_length=200, blank=True)
    hero_subtitle = models.CharField(max_length=500, blank=True)
    about_intro = models.TextField(blank=True)
    about_body = models.TextField(blank=True, help_text="Markdown.")
    whatsapp_message = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["language"]
        constraints = [
            models.UniqueConstraint(fields=["settings", "language"], name="uniq_site_settings_language"),
        ]

    def __str__(self) -> str:
        return f"Site settings ({self.language})"
