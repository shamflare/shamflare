"""Seed initial, honest content. Idempotent and safe to re-run.

* Never creates users.
* Never overwrites existing content: an item that already exists (matched by
  service key, or by any of its seeded translation slugs) is skipped, so
  edits made in the dashboard survive re-runs.
"""

from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.blog.models import BlogCategory, BlogCategoryTranslation, BlogPost, BlogPostTranslation
from apps.core.models import PublicationStatus
from apps.core.seed.blog import CATEGORIES, POSTS
from apps.core.seed.portfolio import PROJECTS
from apps.core.seed.services import SERVICES
from apps.core.seed.site import SITE_SETTINGS
from apps.portfolio.models import PortfolioProject, PortfolioProjectTranslation
from apps.services.models import Service, ServiceTranslation
from apps.site_settings.models import SiteSettings, SiteSettingsTranslation


def _slug_exists(translation_model, translations: dict) -> bool:
    query = Q()
    for lang, data in translations.items():
        query |= Q(language=lang, slug=data["slug"])
    return translation_model.objects.filter(query).exists()


def _find_by_slug(translation_model, parent_field: str, translations: dict):
    query = Q()
    for lang, data in translations.items():
        query |= Q(language=lang, slug=data["slug"])
    match = translation_model.objects.filter(query).select_related(parent_field).first()
    return getattr(match, parent_field) if match else None


class Command(BaseCommand):
    help = "Seed site settings, services, demonstration projects and initial blog articles (idempotent)."

    def handle(self, *args, **options):
        self.created: list[str] = []
        self.skipped: list[str] = []
        with transaction.atomic():
            self.seed_site_settings()
            self.seed_services()
            categories = self.seed_categories()
            self.seed_projects()
            self.seed_posts(categories)

        for line in self.created:
            self.stdout.write(self.style.SUCCESS(f"created  {line}"))
        for line in self.skipped:
            self.stdout.write(f"exists   {line}")
        self.stdout.write(self.style.SUCCESS(f"Done: {len(self.created)} created, {len(self.skipped)} already present."))

    # ------------------------------------------------------------------ #
    def seed_site_settings(self) -> None:
        settings_obj = SiteSettings.load()
        changed = []
        for field in ("company_name", "contact_email", "whatsapp_number"):
            if not getattr(settings_obj, field) and SITE_SETTINGS[field]:
                setattr(settings_obj, field, SITE_SETTINGS[field])
                changed.append(field)
        if changed:
            settings_obj.save()
        if settings_obj.translations.exists():
            self.skipped.append("site settings translations")
            return
        for lang, data in SITE_SETTINGS["translations"].items():
            SiteSettingsTranslation.objects.create(settings=settings_obj, language=lang, **data)
        self.created.append("site settings translations (en, tr, ar)")

    def seed_services(self) -> None:
        for spec in SERVICES:
            if Service.objects.filter(key=spec["key"]).exists():
                self.skipped.append(f"service {spec['key']}")
                continue
            service = Service.objects.create(
                key=spec["key"],
                icon=spec["icon"],
                status=spec["status"],
                is_featured=spec["is_featured"],
                sort_order=spec["sort_order"],
            )
            for lang, data in spec["translations"].items():
                data = {"status": PublicationStatus.PUBLISHED, **data}
                ServiceTranslation.objects.create(service=service, language=lang, **data)
            self.created.append(f"service {spec['key']} [{spec['status']}]")

    def seed_categories(self) -> dict[str, BlogCategory]:
        result = {}
        for spec in CATEGORIES:
            existing = _find_by_slug(BlogCategoryTranslation, "category", spec["translations"])
            if existing is not None:
                result[spec["ref"]] = existing
                self.skipped.append(f"blog category {spec['ref']}")
                continue
            category = BlogCategory.objects.create(sort_order=spec["sort_order"])
            for lang, data in spec["translations"].items():
                BlogCategoryTranslation.objects.create(category=category, language=lang, **data)
            result[spec["ref"]] = category
            self.created.append(f"blog category {spec['ref']}")
        return result

    def seed_projects(self) -> None:
        services = {s.key: s for s in Service.objects.all()}
        for spec in PROJECTS:
            label = spec["translations"]["en"]["slug"]
            if _slug_exists(PortfolioProjectTranslation, spec["translations"]):
                self.skipped.append(f"portfolio project {label}")
                continue
            project = PortfolioProject.objects.create(
                category=services.get(spec["category"]),
                technologies=spec["technologies"],
                is_featured=spec["is_featured"],
                is_demo=spec["is_demo"],
                sort_order=spec["sort_order"],
                status=PublicationStatus.PUBLISHED,
            )
            project.services.set([services[k] for k in spec["services"] if k in services])
            for lang, data in spec["translations"].items():
                PortfolioProjectTranslation.objects.create(
                    project=project, language=lang, status=PublicationStatus.PUBLISHED, **data
                )
            self.created.append(f"portfolio project {label} (demo)")

    def seed_posts(self, categories: dict[str, BlogCategory]) -> None:
        for spec in POSTS:
            label = spec["translations"]["en"]["slug"]
            if _slug_exists(BlogPostTranslation, spec["translations"]):
                self.skipped.append(f"blog post {label}")
                continue
            post = BlogPost.objects.create(
                category=categories.get(spec["category"]),
                status=PublicationStatus.PUBLISHED,
                published_at=timezone.now(),
            )
            for lang, data in spec["translations"].items():
                BlogPostTranslation.objects.create(
                    post=post, language=lang, status=PublicationStatus.PUBLISHED, **data
                )
            self.created.append(f"blog post {label}")
