from __future__ import annotations

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.core.serializers import (
    AvailableLanguagesField,
    TranslatedField,
    TranslatedStringListField,
    TranslatedTextField,
)
from apps.core.translations import (
    TranslatableAdminSerializer,
    TranslationsField,
    public_translation,
    slug_field,
    status_field,
    text_field,
)

from .models import Service, ServiceTranslation

MAX_LIST_ITEMS = 30


class ProcessStepSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=160)
    description = serializers.CharField(max_length=1000, allow_blank=True, required=False, default="")

    def to_representation(self, instance):
        # Tolerate legacy/hand-edited JSON (e.g. from Django admin).
        if not isinstance(instance, dict):
            return {"title": str(instance), "description": ""}
        return {"title": str(instance.get("title", "")), "description": str(instance.get("description", ""))}


# --------------------------------------------------------------------------- #
# Public
# --------------------------------------------------------------------------- #
def service_reference(service: Service | None, lang: str) -> dict | None:
    """``{key, slug, title}`` when the service is publicly visible in ``lang``."""
    if service is None or service.status != "published":
        return None
    translation = public_translation(service, lang)
    if translation is None:
        return None
    return {"key": service.key, "slug": translation.slug, "title": translation.title}


class ServiceReferenceSerializer(serializers.Serializer):
    key = serializers.CharField()
    slug = serializers.CharField()
    title = serializers.CharField()


class PublicServiceListSerializer(serializers.ModelSerializer):
    slug = TranslatedTextField()
    title = TranslatedTextField()
    summary = TranslatedTextField()
    available_languages = AvailableLanguagesField()

    class Meta:
        model = Service
        fields = ["id", "key", "icon", "slug", "title", "summary", "is_featured", "sort_order", "available_languages"]
        read_only_fields = fields


@extend_schema_field(ProcessStepSerializer(many=True))
class TranslatedProcessField(TranslatedField):
    def __init__(self, **kwargs):
        super().__init__(default_value=[], **kwargs)


class PublicServiceDetailSerializer(PublicServiceListSerializer):
    description = TranslatedTextField()
    capabilities = TranslatedStringListField()
    use_cases = TranslatedStringListField()
    process = TranslatedProcessField()
    seo_title = TranslatedTextField()
    seo_description = TranslatedTextField()
    related_projects = serializers.SerializerMethodField()

    class Meta(PublicServiceListSerializer.Meta):
        fields = PublicServiceListSerializer.Meta.fields + [
            "description",
            "capabilities",
            "use_cases",
            "process",
            "seo_title",
            "seo_description",
            "related_projects",
        ]
        read_only_fields = fields

    @extend_schema_field(serializers.ListField(child=serializers.DictField()))
    def get_related_projects(self, obj) -> list[dict]:
        from apps.portfolio.serializers import PublicProjectListSerializer

        projects = getattr(obj, "related_projects", [])
        return PublicProjectListSerializer(projects, many=True, context=self.context).data


# --------------------------------------------------------------------------- #
# Admin
# --------------------------------------------------------------------------- #
class ServiceTranslationAdminSerializer(serializers.Serializer):
    title = text_field(160)
    slug = slug_field(180)
    summary = text_field(500)
    description = text_field()
    capabilities = serializers.ListField(
        child=serializers.CharField(max_length=200), max_length=MAX_LIST_ITEMS, required=False
    )
    use_cases = serializers.ListField(
        child=serializers.CharField(max_length=200), max_length=MAX_LIST_ITEMS, required=False
    )
    process = ProcessStepSerializer(many=True, required=False, max_length=15)
    seo_title = text_field(160)
    seo_description = text_field(320)
    status = status_field()


class ServiceAdminSerializer(TranslatableAdminSerializer):
    translations = TranslationsField(ServiceTranslationAdminSerializer, ServiceTranslation)

    class Meta:
        model = Service
        fields = [
            "id",
            "key",
            "icon",
            "status",
            "is_featured",
            "sort_order",
            "created_at",
            "updated_at",
            "translations",
            "translation_status",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_key(self, value: str) -> str:
        value = value.lower()
        if value == "other":
            raise serializers.ValidationError("'other' is reserved.")
        return value
