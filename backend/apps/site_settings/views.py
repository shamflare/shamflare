from __future__ import annotations

from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser

from apps.core.public import LANG_PARAMETER, PublicAPIMixin

from .models import SiteAppearance, SiteSettings
from .serializers import AppearanceSerializer, PublicSiteSettingsSerializer, SiteSettingsAdminSerializer


def load_settings() -> SiteSettings:
    SiteSettings.load()
    return SiteSettings.objects.prefetch_related("translations").get(pk=SiteSettings.SINGLETON_PK)


@extend_schema(tags=["public"], parameters=[LANG_PARAMETER])
class PublicSiteSettingsView(PublicAPIMixin, generics.RetrieveAPIView):
    serializer_class = PublicSiteSettingsSerializer

    def get_object(self):
        return load_settings()


class SiteSettingsAdminView(generics.RetrieveUpdateAPIView):
    serializer_class = SiteSettingsAdminSerializer
    permission_classes = [IsAdminUser]

    def get_object(self):
        return load_settings()


@extend_schema(tags=["public"])
class PublicAppearanceView(generics.RetrieveAPIView):
    """Colors, fonts and shapes of the public site. Not localized."""

    serializer_class = AppearanceSerializer
    authentication_classes: list = []
    permission_classes = [AllowAny]

    def get_object(self):
        return SiteAppearance.load()


class AppearanceAdminView(generics.RetrieveUpdateAPIView):
    """PUT replaces the whole configuration (missing values fall back to the defaults)."""

    serializer_class = AppearanceSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ["get", "put", "head", "options"]

    def get_object(self):
        return SiteAppearance.load()
