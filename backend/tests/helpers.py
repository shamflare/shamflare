"""Test helpers and small factories."""

from __future__ import annotations

import io
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from PIL import Image
from rest_framework.test import APIClient, APITestCase

from apps.blog.models import BlogCategory, BlogCategoryTranslation, BlogPost, BlogPostTranslation
from apps.portfolio.models import PortfolioProject, PortfolioProjectTranslation
from apps.services.models import Service, ServiceTranslation

PUBLISHED = "published"
DRAFT = "draft"


class BaseAPITestCase(APITestCase):
    def setUp(self):
        super().setUp()
        cache.clear()  # throttle counters live in the cache

    def tearDown(self):
        cache.clear()
        super().tearDown()

    def login_staff(self, client: APIClient | None = None):
        user = make_user("staff", is_staff=True)
        (client or self.client).force_login(user)
        return user

    def assertError(self, response, status_code: int, code: str):
        self.assertEqual(response.status_code, status_code, response.content)
        body = response.json()
        self.assertIn("error", body)
        self.assertEqual(body["error"]["code"], code)
        self.assertIsInstance(body["error"]["message"], str)
        return body["error"]


def make_user(username: str = "user", *, is_staff: bool = False, password: str = "a-strong-test-password", **extra):
    User = get_user_model()
    return User.objects.create_user(username=username, password=password, is_staff=is_staff, **extra)


def service_tr(lang: str, title: str, *, status: str = PUBLISHED, **extra) -> dict:
    return {
        "language": lang,
        "title": title,
        "summary": extra.pop("summary", f"{title} summary"),
        "description": extra.pop("description", f"{title} description"),
        "status": status,
        **extra,
    }


def make_service(key: str, translations: list[dict], *, status: str = PUBLISHED, **extra) -> Service:
    service = Service.objects.create(key=key, status=status, **extra)
    for data in translations:
        ServiceTranslation.objects.create(service=service, **data)
    return service


def make_project(translations: dict[str, str], *, status: str = PUBLISHED, tr_status: str = PUBLISHED, **extra):
    services = extra.pop("services", [])
    project = PortfolioProject.objects.create(status=status, **extra)
    project.services.set(services)
    for lang, title in translations.items():
        PortfolioProjectTranslation.objects.create(
            project=project, language=lang, title=title, summary="s", body="b", status=tr_status
        )
    return project


def make_category(names: dict[str, str]) -> BlogCategory:
    category = BlogCategory.objects.create()
    for lang, name in names.items():
        BlogCategoryTranslation.objects.create(category=category, language=lang, name=name)
    return category


def make_post(
    translations: dict[str, str],
    *,
    status: str = PUBLISHED,
    tr_status: str = PUBLISHED,
    published_at=None,
    body: str = "word " * 450,
    **extra,
) -> BlogPost:
    if published_at is None and status == PUBLISHED:
        published_at = timezone.now() - timedelta(days=1)
    post = BlogPost.objects.create(status=status, published_at=published_at, **extra)
    for lang, title in translations.items():
        BlogPostTranslation.objects.create(
            post=post, language=lang, title=title, excerpt="e", body=body, status=tr_status
        )
    return post


def image_upload(fmt: str = "PNG", name: str = "photo.png", size=(16, 16)) -> SimpleUploadedFile:
    buffer = io.BytesIO()
    Image.new("RGB", size, (20, 120, 200)).save(buffer, format=fmt)
    content_type = {"PNG": "image/png", "JPEG": "image/jpeg", "WEBP": "image/webp", "GIF": "image/gif"}[fmt]
    return SimpleUploadedFile(name, buffer.getvalue(), content_type=content_type)
