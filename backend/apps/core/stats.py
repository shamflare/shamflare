"""Dashboard overview statistics (real database queries)."""

from __future__ import annotations

from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.blog.models import BlogPost
from apps.inquiries.models import InquiryStatus, ProjectInquiry
from apps.inquiries.serializers import InquiryAdminSerializer, service_titles_map
from apps.portfolio.models import PortfolioProject
from apps.services.models import Service

from .models import PublicationStatus, TranslationStatus
from .translations import compute_translation_status

RECENT_INQUIRIES = 5


def _published_count(model) -> dict:
    return model.objects.aggregate(
        total=Count("pk"),
        published=Count("pk", filter=Q(status=PublicationStatus.PUBLISHED)),
    )


def count_untranslated_published_items() -> int:
    """Missing or incomplete translations (per locale) of published items."""
    gaps = 0
    for model in (Service, PortfolioProject, BlogPost):
        for item in model.objects.filter(status=PublicationStatus.PUBLISHED).prefetch_related("translations"):
            gaps += sum(
                1
                for state in compute_translation_status(item).values()
                if state in (TranslationStatus.MISSING, TranslationStatus.INCOMPLETE)
            )
    return gaps


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=["admin"], responses=OpenApiTypes.OBJECT)
    def get(self, request):
        week_ago = timezone.now() - timedelta(days=7)
        inquiries = ProjectInquiry.objects.aggregate(
            total=Count("pk"),
            new=Count("pk", filter=Q(status=InquiryStatus.NEW)),
            in_progress=Count("pk", filter=Q(status=InquiryStatus.IN_PROGRESS)),
            completed=Count("pk", filter=Q(status=InquiryStatus.COMPLETED)),
            archived=Count("pk", filter=Q(status=InquiryStatus.ARCHIVED)),
            last_7_days=Count("pk", filter=Q(created_at__gte=week_ago)),
        )
        blog = BlogPost.objects.aggregate(
            total=Count("pk"),
            published=Count("pk", filter=Q(status=PublicationStatus.PUBLISHED)),
            drafts=Count("pk", filter=Q(status=PublicationStatus.DRAFT)),
        )
        recent = ProjectInquiry.objects.order_by("-created_at")[:RECENT_INQUIRIES]
        context = {"request": request, "service_titles": service_titles_map()}
        return Response(
            {
                "inquiries": inquiries,
                "services": _published_count(Service),
                "portfolio": _published_count(PortfolioProject),
                "blog": blog,
                "translations": {"missing": count_untranslated_published_items()},
                "recent_inquiries": InquiryAdminSerializer(recent, many=True, context=context).data,
            }
        )
