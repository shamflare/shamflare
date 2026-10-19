from __future__ import annotations

from rest_framework import serializers

from apps.core.languages import DEFAULT_LANGUAGE, Language
from apps.services.models import Service, ServiceTranslation

from .models import OTHER_SERVICE, Budget, ProjectInquiry

DESCRIPTION_MIN = 20
DESCRIPTION_MAX = 5000


class InquiryCreateSerializer(serializers.Serializer):
    """Public submission. The backend is the source of truth for validation."""

    name = serializers.CharField(max_length=120)
    email = serializers.EmailField(max_length=254)
    company = serializers.CharField(max_length=160, required=False, allow_blank=True, default="")
    service = serializers.CharField(max_length=60, required=False, allow_blank=True, default="")
    budget = serializers.ChoiceField(choices=Budget.choices, required=False, allow_blank=True, default="")
    description = serializers.CharField(
        min_length=DESCRIPTION_MIN,
        max_length=DESCRIPTION_MAX,
        error_messages={
            "min_length": f"Please describe your project in at least {DESCRIPTION_MIN} characters.",
            "max_length": f"Please keep the description under {DESCRIPTION_MAX} characters.",
        },
    )
    preferred_language = serializers.ChoiceField(choices=Language.choices, required=False, default=DEFAULT_LANGUAGE)
    consent = serializers.BooleanField()
    # Honeypot: invisible to people, tempting for bots. Must stay empty.
    website = serializers.CharField(required=False, allow_blank=True, default="", trim_whitespace=False)

    def validate_service(self, value: str) -> str:
        value = value.strip().lower()
        if value in ("", OTHER_SERVICE):
            return value
        if not Service.objects.published().filter(key=value).exists():
            raise serializers.ValidationError("Select a valid service.")
        return value

    def validate_consent(self, value: bool) -> bool:
        if value is not True:
            raise serializers.ValidationError("You must agree to the processing of your data to send an inquiry.")
        return value

    def validate_website(self, value: str) -> str:
        if value:
            raise serializers.ValidationError("This field must be left empty.")
        return value

    def create(self, validated_data):
        validated_data.pop("website", None)
        return ProjectInquiry.objects.create(**validated_data)


def service_title(service_key: str) -> str:
    if not service_key:
        return ""
    if service_key == OTHER_SERVICE:
        return "Other"
    translation = (
        ServiceTranslation.objects.filter(service__key=service_key, language=DEFAULT_LANGUAGE)
        .only("title")
        .first()
    )
    return translation.title if translation and translation.title else service_key


class InquiryAdminSerializer(serializers.ModelSerializer):
    service_title = serializers.SerializerMethodField()

    class Meta:
        model = ProjectInquiry
        fields = [
            "id",
            "reference",
            "name",
            "email",
            "company",
            "service",
            "service_title",
            "budget",
            "description",
            "preferred_language",
            "consent",
            "status",
            "internal_notes",
            "notification_sent_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [f for f in fields if f not in ("status", "internal_notes")]

    def get_service_title(self, obj) -> str:
        titles = self.context.get("service_titles")
        if titles is not None and obj.service in titles:
            return titles[obj.service]
        return service_title(obj.service)


class InquiryUpdateSerializer(serializers.ModelSerializer):
    """PATCH accepts only ``status`` and ``internal_notes``."""

    class Meta:
        model = ProjectInquiry
        fields = ["status", "internal_notes"]
        extra_kwargs = {"internal_notes": {"max_length": 10000}}

    def to_internal_value(self, data):
        if isinstance(data, dict):
            unknown = set(data) - set(self.fields)
            if unknown:
                raise serializers.ValidationError({f: ["This field cannot be changed."] for f in sorted(unknown)})
        return super().to_internal_value(data)


def service_titles_map() -> dict[str, str]:
    """``{service_key: english title}`` for bulk serialization."""
    titles = {OTHER_SERVICE: "Other", "": ""}
    for key, title in ServiceTranslation.objects.filter(language=DEFAULT_LANGUAGE).values_list(
        "service__key", "title"
    ):
        titles[key] = title or key
    return titles
