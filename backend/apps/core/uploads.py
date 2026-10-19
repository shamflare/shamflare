"""Image upload validation and storage paths.

Uploaded files are verified with Pillow (real content, not the client's
extension or content type), restricted to JPEG/PNG/WebP and to MAX_UPLOAD_MB,
and stored under random UUID names. Client file names are never used.
"""

from __future__ import annotations

import logging
import uuid
from pathlib import PurePosixPath

from django.conf import settings
from django.db import transaction
from django.utils.deconstruct import deconstructible
from PIL import Image, UnidentifiedImageError
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)

ALLOWED_IMAGE_FORMATS = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}
_ALLOWED_EXTENSIONS = set(ALLOWED_IMAGE_FORMATS.values())
MAX_IMAGE_PIXELS = 40_000_000  # ~40 MP; guards against decompression bombs


@deconstructible
class UploadTo:
    """``upload_to`` callable producing ``<prefix>/<uuid>.<ext>``."""

    def __init__(self, prefix: str):
        self.prefix = prefix.strip("/")

    def __call__(self, instance, filename: str) -> str:
        ext = PurePosixPath(filename).suffix.lower().lstrip(".")
        if ext == "jpeg":
            ext = "jpg"
        if ext not in _ALLOWED_EXTENSIONS:
            ext = "bin"
        return f"{self.prefix}/{uuid.uuid4().hex}.{ext}"

    def __eq__(self, other):
        return isinstance(other, UploadTo) and other.prefix == self.prefix

    def __hash__(self):
        return hash(self.prefix)


def max_upload_bytes() -> int:
    return int(settings.MAX_UPLOAD_MB) * 1024 * 1024


def validate_image_upload(file, field: str = "file"):
    """Validate an uploaded image and give it a safe name (detected extension).

    Raises a DRF ValidationError keyed by ``field`` on any problem.
    """
    if file is None or not hasattr(file, "read"):
        raise ValidationError({field: ["No file was submitted."]})
    if not file.size:
        raise ValidationError({field: ["The submitted file is empty."]})
    if file.size > max_upload_bytes():
        raise ValidationError(
            {field: [f"The file is too large. The maximum size is {settings.MAX_UPLOAD_MB} MB."]}
        )

    try:
        file.seek(0)
        with Image.open(file) as img:
            image_format = img.format
            width, height = img.size
            if width * height > MAX_IMAGE_PIXELS:
                raise ValidationError({field: ["The image dimensions are too large."]})
            img.verify()
    except ValidationError:
        raise
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError, SyntaxError, ValueError):
        raise ValidationError({field: ["Upload a valid JPEG, PNG or WebP image."]}) from None
    finally:
        file.seek(0)

    if image_format not in ALLOWED_IMAGE_FORMATS:
        raise ValidationError({field: ["Unsupported image type. Allowed types: JPEG, PNG, WebP."]})

    # Only the detected extension survives; UploadTo replaces the stem with a UUID.
    file.name = f"upload.{ALLOWED_IMAGE_FORMATS[image_format]}"
    return file


def delete_file_on_commit(storage, name: str | None) -> None:
    """Delete a stored file once the current transaction commits (best effort)."""
    if not name:
        return

    def _delete():
        try:
            storage.delete(name)
        except Exception:  # pragma: no cover - best effort cleanup
            logger.warning("Could not delete media file %s", name, exc_info=True)

    transaction.on_commit(_delete)


def image_url(field_file) -> str | None:
    """Root-relative media URL (``/media/...``) or None."""
    if not field_file:
        return None
    try:
        return field_file.url
    except ValueError:
        return None
