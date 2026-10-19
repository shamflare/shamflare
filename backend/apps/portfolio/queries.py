from __future__ import annotations

from django.db.models import Prefetch

from apps.core.translations import published_translations_prefetch
from apps.services.models import Service, ServiceTranslation

from .models import PortfolioProject, PortfolioProjectTranslation


def public_projects(lang: str, *, detail: bool = False):
    """Projects visible in ``lang`` with everything the public serializers need."""
    qs = (
        PortfolioProject.objects.visible_in(lang)
        .select_related("category")
        .prefetch_related(
            published_translations_prefetch(PortfolioProjectTranslation),
            published_translations_prefetch(ServiceTranslation, "category__translations"),
        )
    )
    if detail:
        qs = qs.prefetch_related(
            "images",
            Prefetch(
                "services",
                queryset=Service.objects.published().prefetch_related(
                    published_translations_prefetch(ServiceTranslation)
                ),
            ),
        )
    return qs.order_by("sort_order", "-created_at")
