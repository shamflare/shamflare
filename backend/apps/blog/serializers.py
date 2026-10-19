from __future__ import annotations

from drf_spectacular.utils import extend_schema_field, inline_serializer
from rest_framework import serializers

from apps.core.serializers import AvailableLanguagesField, ImageURLField, TranslatedTextField
from apps.core.translations import (
    TranslatableAdminSerializer,
    TranslationsField,
    public_translation,
    slug_field,
    status_field,
    text_field,
)

from .models import BlogCategory, BlogCategoryTranslation, BlogPost, BlogPostTranslation

CATEGORY_REFERENCE = inline_serializer(
    "BlogCategoryReference",
    fields={"slug": serializers.CharField(), "name": serializers.CharField()},
    allow_null=True,
)


# --------------------------------------------------------------------------- #
# Public
# --------------------------------------------------------------------------- #
class PublicCategorySerializer(serializers.ModelSerializer):
    slug = TranslatedTextField()
    name = TranslatedTextField()
    post_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = BlogCategory
        fields = ["id", "slug", "name", "post_count"]
        read_only_fields = fields


class PublicPostListSerializer(serializers.ModelSerializer):
    slug = TranslatedTextField()
    title = TranslatedTextField()
    excerpt = TranslatedTextField()
    cover_image = ImageURLField()
    cover_alt = TranslatedTextField()
    category = serializers.SerializerMethodField()
    author_name = serializers.CharField(read_only=True)
    reading_time_minutes = serializers.SerializerMethodField()
    available_languages = AvailableLanguagesField()

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "slug",
            "title",
            "excerpt",
            "cover_image",
            "cover_alt",
            "category",
            "author_name",
            "published_at",
            "reading_time_minutes",
            "available_languages",
        ]
        read_only_fields = fields

    @extend_schema_field(CATEGORY_REFERENCE)
    def get_category(self, obj) -> dict | None:
        if obj.category is None:
            return None
        translation = public_translation(obj.category, self.context["lang"])
        if translation is None or not translation.name:
            return None
        return {"slug": translation.slug, "name": translation.name}

    def get_reading_time_minutes(self, obj) -> int:
        translation = public_translation(obj, self.context["lang"])
        return translation.reading_time_minutes if translation else 1


class PublicPostDetailSerializer(PublicPostListSerializer):
    body = TranslatedTextField()
    seo_title = TranslatedTextField()
    seo_description = TranslatedTextField()
    updated_at = serializers.SerializerMethodField()

    class Meta(PublicPostListSerializer.Meta):
        fields = PublicPostListSerializer.Meta.fields + ["body", "seo_title", "seo_description", "updated_at"]
        read_only_fields = fields

    @extend_schema_field(serializers.DateTimeField())
    def get_updated_at(self, obj) -> str:
        translation = public_translation(obj, self.context["lang"])
        latest = max(obj.updated_at, translation.updated_at) if translation else obj.updated_at
        return serializers.DateTimeField().to_representation(latest)


# --------------------------------------------------------------------------- #
# Admin
# --------------------------------------------------------------------------- #
class CategoryTranslationAdminSerializer(serializers.Serializer):
    name = text_field(100)
    slug = slug_field(120)


class CategoryAdminSerializer(TranslatableAdminSerializer):
    translations = TranslationsField(CategoryTranslationAdminSerializer, BlogCategoryTranslation)

    class Meta:
        model = BlogCategory
        fields = ["id", "sort_order", "created_at", "updated_at", "translations", "translation_status"]
        read_only_fields = ["id", "created_at", "updated_at"]


class PostTranslationAdminSerializer(serializers.Serializer):
    title = text_field(200)
    slug = slug_field(220)
    excerpt = text_field(500)
    body = text_field()
    cover_alt = text_field(200)
    seo_title = text_field(160)
    seo_description = text_field(320)
    status = status_field()


class PostAdminSerializer(TranslatableAdminSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(), allow_null=True, required=False
    )
    author_name = serializers.CharField(read_only=True)
    cover_image = ImageURLField()
    translations = TranslationsField(PostTranslationAdminSerializer, BlogPostTranslation)

    class Meta:
        model = BlogPost
        fields = [
            "id",
            "category",
            "author_name",
            "status",
            "published_at",
            "cover_image",
            "created_at",
            "updated_at",
            "translations",
            "translation_status",
        ]
        read_only_fields = ["id", "author_name", "cover_image", "created_at", "updated_at"]
        extra_kwargs = {"published_at": {"required": False, "allow_null": True}}
