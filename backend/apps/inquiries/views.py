from __future__ import annotations

import logging

from django.utils.crypto import salted_hmac
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import filters, generics, mixins, serializers, status, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import BaseThrottle, ScopedRateThrottle

from .models import ProjectInquiry
from .notifications import notify_new_inquiry
from .serializers import (
    InquiryAdminSerializer,
    InquiryCreateSerializer,
    InquiryUpdateSerializer,
    service_titles_map,
)

logger = logging.getLogger(__name__)

USER_AGENT_MAX = 255


def client_ip_hash(request) -> str:
    """Keyed hash of the client IP (resolved with NUM_PROXIES, like throttling)."""
    ip = BaseThrottle().get_ident(request) or ""
    if not ip:
        return ""
    return salted_hmac("shamflare.inquiries.client-ip", ip, algorithm="sha256").hexdigest()


@extend_schema(
    tags=["public"],
    request=InquiryCreateSerializer,
    responses={
        201: inline_serializer(
            "InquiryReceived", fields={"status": serializers.CharField(), "reference": serializers.CharField()}
        )
    },
)
class InquiryCreateView(generics.CreateAPIView):
    serializer_class = InquiryCreateSerializer
    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "inquiries"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save(
            ip_hash=client_ip_hash(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "")[:USER_AGENT_MAX],
        )
        # Persisted. Notification is a separate, optional step that can never
        # turn the stored inquiry into an error response.
        try:
            notify_new_inquiry(inquiry)
        except Exception:  # defensive: notify_new_inquiry already swallows errors
            logger.exception("Inquiry notification hook failed for %s", inquiry.reference)
        return Response({"status": "received", "reference": inquiry.reference}, status=status.HTTP_201_CREATED)


class InquiryAdminViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ProjectInquiry.objects.all()
    serializer_class = InquiryAdminSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ["get", "patch", "delete", "head", "options"]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status"]
    search_fields = ["name", "email", "company", "reference", "description"]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Skip during OpenAPI schema generation (no DB access needed there).
        if self.action == "list" and not getattr(self, "swagger_fake_view", False):
            context["service_titles"] = service_titles_map()
        return context

    @extend_schema(request=InquiryUpdateSerializer, responses=InquiryAdminSerializer)
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        update = InquiryUpdateSerializer(instance, data=request.data, partial=True)
        update.is_valid(raise_exception=True)
        update.save()
        return Response(InquiryAdminSerializer(instance, context=self.get_serializer_context()).data)
