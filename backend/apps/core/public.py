"""Helpers for the public (anonymous, read-only) API."""

from __future__ import annotations

from urllib.parse import unquote

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter
from rest_framework import serializers
from rest_framework.permissions import AllowAny

from .languages import DEFAULT_LANGUAGE, LANGUAGE_CODES

LANG_PARAMETER = OpenApiParameter(
    "lang", OpenApiTypes.STR, enum=list(LANGUAGE_CODES), description="Content locale (default en)."
)

_TRUE = {"true", "1"}
_FALSE = {"false", "0"}


def parse_language(request) -> str:
    lang = request.query_params.get("lang", DEFAULT_LANGUAGE) or DEFAULT_LANGUAGE
    if lang not in LANGUAGE_CODES:
        raise serializers.ValidationError(
            {"lang": [f"Unsupported language '{lang[:10]}'. Use one of: {', '.join(LANGUAGE_CODES)}."]}
        )
    return lang


def parse_bool_param(request, name: str) -> bool | None:
    raw = request.query_params.get(name)
    if raw is None or raw == "":
        return None
    value = raw.lower()
    if value in _TRUE:
        return True
    if value in _FALSE:
        return False
    raise serializers.ValidationError({name: ["Expected true or false."]})


def normalize_slug(slug: str) -> str:
    # Tolerate percent-encoded unicode slugs coming from proxies/frontends.
    return unquote(slug).lower()


class PublicAPIMixin:
    """Anonymous, read-only, locale-aware. No session auth => no CSRF coupling."""

    authentication_classes: list = []
    permission_classes = [AllowAny]

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        self.lang = parse_language(request)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["lang"] = getattr(self, "lang", DEFAULT_LANGUAGE)
        return context
