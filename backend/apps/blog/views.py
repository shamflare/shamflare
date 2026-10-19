from __future__ import annotations

from django.db.models import Count, Exists, IntegerField, OuterRef, Subquery, Value
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import generics

from apps.core.admin_api import AdminModelViewSet, CoverImageMixin
from apps.core.public import LANG_PARAMETER, PublicAPIMixin, normalize_slug
from apps.core.translations import published_translations_prefetch

from .models import BlogCategory, BlogCategoryTranslation, BlogPost, BlogPostTranslation
from .serializers import (
    CategoryAdminSerializer,
    PostAdminSerializer,
    PublicCategorySerializer,
    PublicPostDetailSerializer,
    PublicPostListSerializer,
)


def public_posts(lang: str):
    return (
        BlogPost.objects.visible_in(lang)
        .select_related("author", "category")
        .prefetch_related(
            published_translations_prefetch(BlogPostTranslation),
            published_translations_prefetch(BlogCategoryTranslation, "category__translations"),
        )
        .order_by("-published_at", "-id")
    )


@extend_schema(tags=["public"], parameters=[LANG_PARAMETER])
class PublicCategoryListView(PublicAPIMixin, generics.ListAPIView):
    serializer_class = PublicCategorySerializer
    pagination_class = None

    def get_queryset(self):
        lang = self.lang
        translated = BlogCategoryTranslation.objects.filter(category=OuterRef("pk"), language=lang).exclude(name="")
        post_counts = (
            BlogPost.objects.visible_in(lang)
            .filter(category=OuterRef("pk"))
            .order_by()
            .values("category")
            .annotate(c=Count("pk", distinct=True))
            .values("c")
        )
        return (
            BlogCategory.objects.filter(Exists(translated))
            .annotate(post_count=Coalesce(Subquery(post_counts, output_field=IntegerField()), Value(0)))
            .prefetch_related(published_translations_prefetch(BlogCategoryTranslation))
            .order_by("sort_order", "id")
        )


@extend_schema(
    tags=["public"],
    parameters=[LANG_PARAMETER, OpenApiParameter("category", OpenApiTypes.STR, description="Category slug in that locale.")],
)
class PublicPostListView(PublicAPIMixin, generics.ListAPIView):
    serializer_class = PublicPostListSerializer

    def get_queryset(self):
        qs = public_posts(self.lang)
        category = self.request.query_params.get("category")
        if category:
            matching = BlogCategoryTranslation.objects.filter(
                language=self.lang, slug=normalize_slug(category)
            ).values("category_id")
            qs = qs.filter(category_id__in=matching)
        return qs


@extend_schema(tags=["public"], parameters=[LANG_PARAMETER])
class PublicPostDetailView(PublicAPIMixin, generics.RetrieveAPIView):
    serializer_class = PublicPostDetailSerializer
    lookup_url_kwarg = "slug"

    def get_object(self):
        slug = normalize_slug(self.kwargs["slug"])
        return get_object_or_404(
            public_posts(self.lang).filter(translations__language=self.lang, translations__slug=slug)
        )


class CategoryAdminViewSet(AdminModelViewSet):
    serializer_class = CategoryAdminSerializer
    search_fields = ["translations__name"]
    ordering_fields = ["sort_order", "created_at"]
    ordering = ["sort_order", "id"]

    def get_queryset(self):
        return BlogCategory.objects.prefetch_related("translations")


class PostAdminViewSet(CoverImageMixin, AdminModelViewSet):
    serializer_class = PostAdminSerializer
    filterset_fields = ["status", "category"]
    search_fields = ["translations__title", "translations__excerpt"]
    ordering_fields = ["published_at", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return BlogPost.objects.select_related("author").prefetch_related("translations")

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
