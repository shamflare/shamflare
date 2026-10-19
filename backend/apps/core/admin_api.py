"""Building blocks for the staff-only administration API."""

from __future__ import annotations

from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import filters, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .uploads import delete_file_on_commit, validate_image_upload

FILE_UPLOAD_REQUEST = inline_serializer("ImageUpload", fields={"file": serializers.ImageField()})


class AdminModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]


class CoverImageMixin:
    """Adds ``POST/DELETE {id}/cover/`` (multipart ``file``) for ``cover_image``."""

    @extend_schema(request={"multipart/form-data": FILE_UPLOAD_REQUEST}, methods=["POST"])
    @extend_schema(request=None, methods=["DELETE"])
    @action(detail=True, methods=["post", "delete"], url_path="cover", parser_classes=[MultiPartParser])
    def cover(self, request, pk=None):
        instance = self.get_object()
        storage = instance.cover_image.storage
        old_name = instance.cover_image.name

        if request.method == "DELETE":
            with transaction.atomic():
                instance.cover_image = ""
                instance.save(update_fields=["cover_image", "updated_at"])
                delete_file_on_commit(storage, old_name)
        else:
            upload = validate_image_upload(request.FILES.get("file"))
            with transaction.atomic():
                instance.cover_image.save(upload.name, upload, save=False)
                instance.save(update_fields=["cover_image", "updated_at"])
                if old_name and old_name != instance.cover_image.name:
                    delete_file_on_commit(storage, old_name)

        fresh = self.get_queryset().get(pk=instance.pk)
        return Response(self.get_serializer(fresh).data, status=status.HTTP_200_OK)
