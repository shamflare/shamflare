from __future__ import annotations

from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAdminUser

from apps.core.public import LANG_PARAMETER, PublicAPIMixin

from .models import SiteSettings
from .serializers import PublicSiteSettingsSerializer, SiteSettingsAdminSerializer


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
