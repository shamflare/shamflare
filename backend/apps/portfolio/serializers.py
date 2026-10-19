from __future__ import annotations

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.core.serializers import AvailableLanguagesField, ImageURLField, TranslatedTextField
from apps.core.translations import (
    TranslatableAdminSerializer,
    TranslationsField,
    slug_field,
    status_field,
    text_field,
)
from apps.core.uploads import image_url
from apps.services.models import Service
from apps.services.serializers import ServiceReferenceSerializer, service_reference

from .models import PortfolioImage, PortfolioProject, PortfolioProjectTranslation

MAX_TECHNOLOGIES = 30


# --------------------------------------------------------------------------- #
# Public
# --------------------------------------------------------------------------- #
class PublicProjectListSerializer(serializers.ModelSerializer):
    slug = TranslatedTextField()
    title = TranslatedTextField()
    summary = TranslatedTextField()
    cover_image = ImageURLField()
    cover_alt = TranslatedTextField()
    category = serializers.SerializerMethodField()
    available_languages = AvailableLanguagesField()

    class Meta:
        model = PortfolioProject
        fields = [
            "id",
            "slug",
            "title",
            "summary",
            "cover_image",
            "cover_alt",
            "category",
            "technologies",
            "is_featured",
            "is_demo",
            "external_url",
            "available_languages",
        ]
        read_only_fields = fields

    @extend_schema_field(ServiceReferenceSerializer(allow_null=True))
    def get_category(self, obj) -> dict | None:
        return service_reference(obj.category, self.context["lang"])


class PublicProjectImageSerializer(serializers.ModelSerializer):
    url = ImageURLField(source="image")
    alt = serializers.CharField(source="alt_text")

    class Meta:
        model = PortfolioImage
        fields = ["id", "url", "alt"]
        read_only_fields = fields


class PublicProjectDetailSerializer(PublicProjectListSerializer):
    body = TranslatedTextField()
    images = PublicProjectImageSerializer(many=True, read_only=True)
    seo_title = TranslatedTextField()
    seo_description = TranslatedTextField()
    services = serializers.SerializerMethodField()

    class Meta(PublicProjectListSerializer.Meta):
        fields = PublicProjectListSerializer.Meta.fields + ["body", "images", "seo_title", "seo_description", "services"]
        read_only_fields = fields

    @extend_schema_field(ServiceReferenceSerializer(many=True))
    def get_services(self, obj) -> list[dict]:
        lang = self.context["lang"]
        refs = (service_reference(s, lang) for s in obj.services.all())
        return [r for r in refs if r is not None]


# --------------------------------------------------------------------------- #
# Admin
# --------------------------------------------------------------------------- #
class ProjectTranslationAdminSerializer(serializers.Serializer):
    title = text_field(160)
    slug = slug_field(180)
    summary = text_field(500)
    body = text_field()
    cover_alt = text_field(200)
    seo_title = text_field(160)
    seo_description = text_field(320)
    status = status_field()


class AdminProjectImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioImage
        fields = ["id", "url", "alt_text", "sort_order"]
        read_only_fields = fields

    def get_url(self, obj) -> str | None:
        return image_url(obj.image)


class ProjectAdminSerializer(TranslatableAdminSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all(), allow_null=True, required=False)
    services = serializers.PrimaryKeyRelatedField(queryset=Service.objects.all(), many=True, required=False)
    technologies = serializers.ListField(
        child=serializers.CharField(max_length=60), max_length=MAX_TECHNOLOGIES, required=False
    )
    cover_image = ImageURLField()
    images = AdminProjectImageSerializer(many=True, read_only=True)
    translations = TranslationsField(ProjectTranslationAdminSerializer, PortfolioProjectTranslation)

    class Meta:
        model = PortfolioProject
        fields = [
            "id",
            "category",
            "services",
            "technologies",
            "external_url",
            "is_featured",
            "is_demo",
            "status",
            "sort_order",
            "cover_image",
            "images",
            "created_at",
            "updated_at",
            "translations",
            "translation_status",
        ]
        read_only_fields = ["id", "cover_image", "images", "created_at", "updated_at"]

    def validate_technologies(self, value: list[str]) -> list[str]:
        seen, result = set(), []
        for item in (v.strip() for v in value):
            if item and item.lower() not in seen:
                seen.add(item.lower())
                result.append(item)
        return result

    def validate_external_url(self, value: str) -> str:
        if value and not value.lower().startswith(("https://", "http://")):
            raise serializers.ValidationError("Only http(s) URLs are allowed.")
        return value


class ImageUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    alt_text = serializers.CharField(max_length=200, allow_blank=True, required=False, default="")
