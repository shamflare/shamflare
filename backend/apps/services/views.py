from __future__ import annotations

from django.db.models import Q
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import generics

from apps.core.admin_api import AdminModelViewSet
from apps.core.public import LANG_PARAMETER, PublicAPIMixin, normalize_slug, parse_bool_param
from apps.core.translations import published_translations_prefetch

from .models import Service, ServiceTranslation
from .serializers import PublicServiceDetailSerializer, PublicServiceListSerializer, ServiceAdminSerializer

MAX_RELATED_PROJECTS = 6


def public_services(lang: str):
    return (
        Service.objects.visible_in(lang)
        .prefetch_related(published_translations_prefetch(ServiceTranslation))
        .order_by("sort_order", "id")
    )


@extend_schema(tags=["public"], parameters=[LANG_PARAMETER, OpenApiParameter("featured", OpenApiTypes.BOOL)])
class PublicServiceListView(PublicAPIMixin, generics.ListAPIView):
    serializer_class = PublicServiceListSerializer

    def get_queryset(self):
        qs = public_services(self.lang)
        featured = parse_bool_param(self.request, "featured")
        if featured is not None:
            qs = qs.filter(is_featured=featured)
        return qs


@extend_schema(tags=["public"], parameters=[LANG_PARAMETER])
class PublicServiceDetailView(PublicAPIMixin, generics.RetrieveAPIView):
    serializer_class = PublicServiceDetailSerializer
    lookup_url_kwarg = "slug"

    def get_object(self):
        from apps.portfolio.queries import public_projects

        slug = normalize_slug(self.kwargs["slug"])
        service = get_object_or_404(
            public_services(self.lang).filter(translations__language=self.lang, translations__slug=slug)
        )
        related_ids = (
            public_projects(self.lang)
            .filter(Q(category=service) | Q(services=service))
            .order_by()
            .values_list("pk", flat=True)
            .distinct()
        )
        service.related_projects = list(
            public_projects(self.lang).filter(pk__in=list(related_ids))[:MAX_RELATED_PROJECTS]
        )
        return service


class ServiceAdminViewSet(AdminModelViewSet):
    serializer_class = ServiceAdminSerializer
    filterset_fields = ["status", "is_featured"]
    search_fields = ["key", "translations__title"]
    ordering_fields = ["sort_order", "created_at", "updated_at"]
    ordering = ["sort_order", "id"]

    def get_queryset(self):
        return Service.objects.prefetch_related("translations")
