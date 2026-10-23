from __future__ import annotations

from django.http import Http404
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAdminUser

from apps.core.public import LANG_PARAMETER, PublicAPIMixin

from .models import LegalDocument, LegalDocumentKind
from .serializers import LegalDocumentAdminSerializer, PublicLegalDocumentSerializer


def load_document(kind: str) -> LegalDocument:
    if kind not in LegalDocumentKind.values:
        raise Http404
    LegalDocument.load(kind)
    return LegalDocument.objects.prefetch_related("translations").get(kind=kind)


@extend_schema(tags=["public"], parameters=[LANG_PARAMETER])
class PublicLegalDocumentView(PublicAPIMixin, generics.RetrieveAPIView):
    """Privacy Policy or Terms of Use. An empty ``body`` means: use the built-in text."""

    serializer_class = PublicLegalDocumentSerializer

    def get_object(self):
        return load_document(self.kwargs["kind"])


class LegalDocumentAdminView(generics.RetrieveUpdateAPIView):
    serializer_class = LegalDocumentAdminSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ["get", "put", "head", "options"]

    def get_object(self):
        return load_document(self.kwargs["kind"])
