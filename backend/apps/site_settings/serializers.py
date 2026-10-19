from __future__ import annotations

from rest_framework import serializers

from apps.core.translations import TranslatableAdminSerializer, TranslationsField, text_field

from .models import SiteSettings, SiteSettingsTranslation

MAX_SOCIAL_LINKS = 12


class SocialLinkSerializer(serializers.Serializer):
    label = serializers.CharField(max_length=50)
    url = serializers.URLField(max_length=500)

    def validate_url(self, value: str) -> str:
        if not value.lower().startswith(("https://", "http://")):
            raise serializers.ValidationError("Only http(s) URLs are allowed.")
        return value


class PublicSiteSettingsSerializer(serializers.Serializer):
    """Built from the singleton plus its translation in ``context['lang']``."""

    company_name = serializers.CharField()
    tagline = serializers.CharField()
    hero_title = serializers.CharField()
    hero_subtitle = serializers.CharField()
    about_intro = serializers.CharField()
    about_body = serializers.CharField()
    contact_email = serializers.CharField()
    whatsapp_number = serializers.CharField()
    whatsapp_message = serializers.CharField()
    whatsapp_url = serializers.CharField()
    social_links = SocialLinkSerializer(many=True)

    TRANSLATED = ("tagline", "hero_title", "hero_subtitle", "about_intro", "about_body", "whatsapp_message")

    def to_representation(self, instance: SiteSettings):
        lang = self.context["lang"]
        translation = next((t for t in instance.translations.all() if t.language == lang), None)
        data = {
            "company_name": instance.company_name,
            "contact_email": instance.contact_email,
            "whatsapp_number": instance.whatsapp_number,
            "social_links": [
                {"label": link.get("label", ""), "url": link.get("url", "")}
                for link in (instance.social_links or [])
                if isinstance(link, dict)
            ],
        }
        for field in self.TRANSLATED:
            data[field] = getattr(translation, field, "") if translation else ""
        data["whatsapp_url"] = instance.whatsapp_url(data["whatsapp_message"])
        return {name: data[name] for name in self.fields}


class SiteSettingsTranslationAdminSerializer(serializers.Serializer):
    tagline = text_field(200)
    hero_title = text_field(200)
    hero_subtitle = text_field(500)
    about_intro = text_field()
    about_body = text_field()
    whatsapp_message = text_field(300)


class SiteSettingsAdminSerializer(TranslatableAdminSerializer):
    whatsapp_number = serializers.CharField(max_length=30, allow_blank=True, required=False)
    social_links = SocialLinkSerializer(many=True, required=False, max_length=MAX_SOCIAL_LINKS)
    translations = TranslationsField(SiteSettingsTranslationAdminSerializer, SiteSettingsTranslation)

    class Meta:
        model = SiteSettings
        fields = [
            "company_name",
            "contact_email",
            "whatsapp_number",
            "social_links",
            "translations",
            "translation_status",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]

    def validate_whatsapp_number(self, value: str) -> str:
        # Accept "+90 534 ..." style input but store digits only.
        digits = "".join(ch for ch in value if ch.isdigit())
        if value and not (8 <= len(digits) <= 15):
            raise serializers.ValidationError("Enter the international number as 8–15 digits.")
        return digits
