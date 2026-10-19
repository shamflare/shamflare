"""Reusable read-only serializer fields for the public API."""

from __future__ import annotations

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field, inline_serializer
from rest_framework import serializers

from .translations import available_languages, public_translation
from .uploads import image_url


class TranslatedField(serializers.Field):
    """Reads ``attr`` from the object's published translation in ``context['lang']``."""

    def __init__(self, attr: str | None = None, default_value="", **kwargs):
        self.attr = attr
        self.default_value = default_value
        kwargs["read_only"] = True
        super().__init__(**kwargs)

    def get_attribute(self, instance):
        translation = public_translation(instance, self.context["lang"])
        if translation is None:
            return self.default_value
        return getattr(translation, self.attr or self.field_name)

    def to_representation(self, value):
        return value


@extend_schema_field(OpenApiTypes.STR)
class TranslatedTextField(TranslatedField):
    pass


@extend_schema_field({"type": "array", "items": {"type": "string"}})
class TranslatedStringListField(TranslatedField):
    def __init__(self, attr=None, **kwargs):
        super().__init__(attr, default_value=[], **kwargs)


@extend_schema_field(
    serializers.ListField(
        child=inline_serializer(
            "AvailableLanguage",
            fields={"language": serializers.CharField(), "slug": serializers.CharField()},
        )
    )
)
class AvailableLanguagesField(serializers.Field):
    def __init__(self, **kwargs):
        kwargs["read_only"] = True
        kwargs.setdefault("source", "*")
        super().__init__(**kwargs)

    def to_representation(self, instance):
        return available_languages(instance)


@extend_schema_field({"type": "string", "nullable": True, "example": "/media/portfolio/covers/abc.webp"})
class ImageURLField(serializers.Field):
    """Root-relative media URL or null."""

    def __init__(self, **kwargs):
        kwargs["read_only"] = True
        super().__init__(**kwargs)

    def to_representation(self, value):
        return image_url(value)
