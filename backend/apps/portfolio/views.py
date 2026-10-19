from __future__ import annotations

from django.db import transaction
from django.db.models import Max, Q
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, inline_serializer
from rest_framework import generics, serializers
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from apps.core.admin_api import AdminModelViewSet, CoverImageMixin
from apps.core.public import LANG_PARAMETER, PublicAPIMixin, normalize_slug, parse_bool_param
from apps.core.uploads import validate_image_upload

from .models import PortfolioImage, PortfolioProject
from .queries import public_projects
from .serializers import (
    ImageUploadSerializer,
    ProjectAdminSerializer,
    PublicProjectDetailSerializer,
    PublicProjectListSerializer,
)

MAX_GALLERY_IMAGES = 30


@extend_schema(
    tags=["public"],
    parameters=[
        LANG_PARAMETER,
        OpenApiParameter("service", OpenApiTypes.STR, description="Service key."),
        OpenApiParameter("featured", OpenApiTypes.BOOL),
    ],
)
class PublicProjectListView(PublicAPIMixin, generics.ListAPIView):
    serializer_class = PublicProjectListSerializer

    def get_queryset(self):
        qs = public_projects(self.lang)
        service_key = self.request.query_params.get("service")
        if service_key:
            matching = PortfolioProject.objects.filter(
                Q(category__key=service_key) | Q(services__key=service_key)
            ).values("pk")
            qs = qs.filter(pk__in=matching)
        featured = parse_bool_param(self.request, "featured")
        if featured is not None:
            qs = qs.filter(is_featured=featured)
        return qs


@extend_schema(tags=["public"], parameters=[LANG_PARAMETER])
class PublicProjectDetailView(PublicAPIMixin, generics.RetrieveAPIView):
    serializer_class = PublicProjectDetailSerializer
    lookup_url_kwarg = "slug"

    def get_object(self):
        slug = normalize_slug(self.kwargs["slug"])
        qs = public_projects(self.lang, detail=True).filter(
            translations__language=self.lang, translations__slug=slug
        )
        return get_object_or_404(qs)


class ProjectAdminViewSet(CoverImageMixin, AdminModelViewSet):
    serializer_class = ProjectAdminSerializer
    filterset_fields = ["status", "is_featured", "is_demo", "category"]
    search_fields = ["translations__title"]
    ordering_fields = ["sort_order", "created_at", "updated_at"]
    ordering = ["sort_order", "-created_at"]

    def get_queryset(self):
        return PortfolioProject.objects.prefetch_related("translations", "services", "images")

    def perform_destroy(self, instance):
        with transaction.atomic():
            instance.delete()  # files are removed by post_delete signals after commit

    @extend_schema(
        request={
            "multipart/form-data": inline_serializer(
                "GalleryImageUpload",
                fields={"file": serializers.ImageField(), "alt_text": serializers.CharField(required=False)},
            )
        },
        responses=ProjectAdminSerializer,
    )
    @action(detail=True, methods=["post"], url_path="images", parser_classes=[MultiPartParser])
    def add_image(self, request, pk=None):
        project = self.get_object()
        if project.images.count() >= MAX_GALLERY_IMAGES:
            raise serializers.ValidationError({"file": [f"A project can have at most {MAX_GALLERY_IMAGES} images."]})
        payload = ImageUploadSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        upload = validate_image_upload(payload.validated_data["file"])
        next_order = (project.images.aggregate(m=Max("sort_order"))["m"] or 0) + 1
        image = PortfolioImage(project=project, alt_text=payload.validated_data["alt_text"], sort_order=next_order)
        image.image.save(upload.name, upload, save=False)
        image.save()
        return Response(self.get_serializer(self.get_queryset().get(pk=project.pk)).data)

    @extend_schema(request=None, responses=ProjectAdminSerializer)
    @action(detail=True, methods=["delete"], url_path=r"images/(?P<image_id>\d+)")
    def delete_image(self, request, pk=None, image_id=None):
        project = self.get_object()
        image = get_object_or_404(PortfolioImage, pk=image_id, project=project)
        with transaction.atomic():
            image.delete()  # file removed by post_delete signal after commit
        return Response(self.get_serializer(self.get_queryset().get(pk=project.pk)).data)

