"""Translation helpers shared by the public and admin APIs.

Every translatable entity has ``translations`` (reverse FK) pointing at a
:class:`~apps.core.models.TranslationModel` subclass, with one row per
(parent, language).

Admin write semantics for the ``translations`` object keyed by language:

* a provided language is **upserted** (existing row updated in place, new row
  created otherwise - never duplicated);
* a language set to ``null`` deletes that translation;
* omitted languages are left untouched.
"""

from __future__ import annotations

from django.db import IntegrityError, models, transaction
from django.db.models import Prefetch
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .languages import LANGUAGE_CODES, language_order
from .models import PublicationStatus, TranslationModel, TranslationStatus

SLUG_TAKEN_MESSAGE = "This slug is already used by another item in this language."
PUBLISH_REQUIRED_MESSAGE = "This field is required to publish this translation."


# --------------------------------------------------------------------------- #
# Reading
# --------------------------------------------------------------------------- #
def translations_by_language(instance) -> dict[str, TranslationModel]:
    if instance is None or instance.pk is None:
        return {}
    return {t.language: t for t in instance.translations.all()}


def compute_translation_status(instance) -> dict[str, str]:
    """``{lang: published|draft|incomplete|missing}`` for every locale.

    * ``missing``: no row for that language;
    * ``incomplete``: a row exists but one of ``REQUIRED_FIELDS`` is empty;
    * otherwise the row's own status (tables without status: ``published``).
    """
    by_lang = translations_by_language(instance)
    result = {}
    for lang in LANGUAGE_CODES:
        t = by_lang.get(lang)
        if t is None:
            result[lang] = TranslationStatus.MISSING.value
        elif t.missing_required_fields():
            result[lang] = TranslationStatus.INCOMPLETE.value
        elif t.HAS_STATUS:
            result[lang] = t.status
        else:
            result[lang] = TranslationStatus.PUBLISHED.value
    return result


def published_translations_prefetch(translation_model, lookup: str = "translations") -> Prefetch:
    """Prefetch published translations into ``obj.public_translations``."""
    qs = translation_model.objects.all()
    if translation_model.HAS_STATUS:
        qs = qs.filter(status=PublicationStatus.PUBLISHED)
    return Prefetch(lookup, queryset=qs, to_attr="public_translations")


def public_translation(obj, lang: str):
    """The publicly visible translation of ``obj`` in ``lang`` (needs the prefetch)."""
    for t in getattr(obj, "public_translations", ()):
        if t.language == lang:
            return t
    return None


def available_languages(obj) -> list[dict]:
    translations = sorted(getattr(obj, "public_translations", ()), key=lambda t: language_order(t.language))
    return [{"language": t.language, "slug": t.slug} for t in translations]


# --------------------------------------------------------------------------- #
# Admin serializer field
# --------------------------------------------------------------------------- #
@extend_schema_field(OpenApiTypes.OBJECT)
class TranslationsField(serializers.Field):
    """``{"en": {...} | null, "tr": ..., "ar": ...}`` with upsert semantics.

    ``child`` is a plain Serializer class for one translation; every field on
    it should be optional so drafts can be saved incrementally.
    """

    def __init__(self, child, model: type[TranslationModel], **kwargs):
        self.child_class = child
        self.translation_model = model
        kwargs.setdefault("required", False)
        super().__init__(**kwargs)

    def get_attribute(self, instance):
        return instance

    def to_representation(self, instance):
        by_lang = translations_by_language(instance)
        return {
            lang: (self.child_class(by_lang[lang], context=self.context).data if lang in by_lang else None)
            for lang in LANGUAGE_CODES
        }

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            raise serializers.ValidationError("Expected an object keyed by language code (en, tr, ar).")

        model = self.translation_model
        parent_instance = getattr(self.parent, "instance", None)
        existing = translations_by_language(parent_instance)
        has_slug = model.SLUG_SOURCE_FIELD is not None
        errors: dict = {}
        result: dict = {}

        for lang, payload in data.items():
            if lang not in LANGUAGE_CODES:
                errors[lang] = ["Unsupported language. Use one of: " + ", ".join(LANGUAGE_CODES) + "."]
                continue
            if payload is None:
                result[lang] = None
                continue
            if not isinstance(payload, dict):
                errors[lang] = ["Expected an object or null."]
                continue

            current = existing.get(lang)
            # partial=False on purpose: every child field is optional, so omitted
            # fields are simply absent from validated_data (upsert semantics),
            # while nested items (e.g. process steps) still get full validation.
            child = self.child_class(instance=current, data=payload, context=self.context)
            if not child.is_valid():
                errors[lang] = child.errors
                continue
            values = dict(child.validated_data)
            lang_errors: dict[str, list[str]] = {}

            if has_slug and values.get("slug"):
                taken = model.objects.filter(language=lang, slug=values["slug"])
                if current is not None:
                    taken = taken.exclude(pk=current.pk)
                if taken.exists():
                    lang_errors["slug"] = [SLUG_TAKEN_MESSAGE]

            if model.HAS_STATUS:
                status = values.get("status", getattr(current, "status", PublicationStatus.DRAFT))
                if status == PublicationStatus.PUBLISHED:
                    for field in model.publish_required_fields():
                        value = values[field] if field in values else getattr(current, field, None)
                        if not value:
                            lang_errors.setdefault(field, []).append(PUBLISH_REQUIRED_MESSAGE)

            if lang_errors:
                errors[lang] = lang_errors
            else:
                result[lang] = values

        if errors:
            raise serializers.ValidationError(errors)
        return result


def save_translations(instance: models.Model, translations: dict | None) -> None:
    """Apply validated ``translations`` data to ``instance`` (call inside a transaction)."""
    if not translations:
        return
    manager = instance.translations
    model = manager.model
    fk_name = manager.field.name
    existing = {t.language: t for t in model.objects.filter(**{fk_name: instance})}

    for lang, values in translations.items():
        current = existing.get(lang)
        if values is None:
            if current is not None:
                current.delete()
            continue
        obj = current or model(**{fk_name: instance, "language": lang})
        for field, value in values.items():
            setattr(obj, field, value)
        obj.save()

    cache = getattr(instance, "_prefetched_objects_cache", None)
    if cache:
        cache.pop("translations", None)


class TranslatableAdminSerializer(serializers.ModelSerializer):
    """ModelSerializer that persists a ``translations`` TranslationsField atomically."""

    translation_status = serializers.SerializerMethodField()

    def get_translation_status(self, obj) -> dict[str, str]:
        return compute_translation_status(obj)

    def _save(self, saver, validated_data):
        translations = validated_data.pop("translations", None)
        try:
            with transaction.atomic():
                instance = saver(validated_data)
                save_translations(instance, translations)
                self.after_translations_saved(instance)
        except IntegrityError:
            # Lost a race on the (language, slug) unique constraint.
            raise serializers.ValidationError(
                {"translations": {lang: {"slug": [SLUG_TAKEN_MESSAGE]} for lang in (translations or {})}}
            ) from None
        return instance

    def after_translations_saved(self, instance) -> None:
        """Hook for subclasses (runs inside the same transaction)."""

    def create(self, validated_data):
        return self._save(lambda data: super(TranslatableAdminSerializer, self).create(data), validated_data)

    def update(self, instance, validated_data):
        return self._save(
            lambda data: super(TranslatableAdminSerializer, self).update(instance, data), validated_data
        )


# --------------------------------------------------------------------------- #
# Reusable child-serializer fields
# --------------------------------------------------------------------------- #
def slug_field(max_length: int = 180) -> serializers.Field:
    return LowercaseSlugField(max_length=max_length, allow_unicode=True, allow_blank=True, required=False)


class LowercaseSlugField(serializers.SlugField):
    def to_internal_value(self, data):
        return super().to_internal_value(data.lower() if isinstance(data, str) else data)


def text_field(max_length: int | None = None) -> serializers.CharField:
    return serializers.CharField(max_length=max_length, allow_blank=True, required=False)


def status_field() -> serializers.ChoiceField:
    return serializers.ChoiceField(choices=PublicationStatus.choices, required=False)
