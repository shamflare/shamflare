from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers

from apps.core.translations import TranslatableAdminSerializer, TranslationsField, text_field

from .models import LegalDocument, LegalDocumentTranslation

MAX_BODY_LENGTH = 50_000


class PublicLegalDocumentSerializer(serializers.Serializer):
    """The document in ``context['lang']``; ``body`` is empty when that language has no text."""

    kind = serializers.CharField()
    body = serializers.CharField()
    updated_at = serializers.DateTimeField(allow_null=True)

    def to_representation(self, instance: LegalDocument):
        lang = self.context["lang"]
        translation = next((t for t in instance.translations.all() if t.language == lang), None)
        return {
            "kind": instance.kind,
            "body": translation.body if translation else "",
            "updated_at": instance.content_updated_at.isoformat() if instance.content_updated_at else None,
        }


class LegalDocumentTranslationAdminSerializer(serializers.Serializer):
    body = text_field(MAX_BODY_LENGTH)


def _bodies(instance: LegalDocument) -> dict[str, str]:
    return {t.language: t.body for t in LegalDocumentTranslation.objects.filter(document=instance)}


class LegalDocumentAdminSerializer(TranslatableAdminSerializer):
    translations = TranslationsField(LegalDocumentTranslationAdminSerializer, LegalDocumentTranslation)

    class Meta:
        model = LegalDocument
        fields = ["kind", "translations", "translation_status", "content_updated_at", "updated_at"]
        read_only_fields = ["kind", "content_updated_at", "updated_at"]

    def update(self, instance, validated_data):
        before = _bodies(instance)
        instance = super().update(instance, validated_data)
        if _bodies(instance) != before:
            instance.content_updated_at = timezone.now()
            instance.save(update_fields=["content_updated_at", "updated_at"])
        return instance
