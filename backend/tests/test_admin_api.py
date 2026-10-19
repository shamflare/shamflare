from datetime import timedelta

from django.utils import timezone

from apps.blog.models import BlogPost
from apps.inquiries.models import ProjectInquiry
from apps.services.models import ServiceTranslation
from apps.site_settings.models import SiteSettings

from .helpers import BaseAPITestCase, make_service, make_user, service_tr

SERVICES = "/api/v1/admin/services/"


def full_translation(title, **extra):
    return {"title": title, "summary": "Summary", "description": "Body", "status": "published", **extra}


class ServiceTranslationUpsertTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.login_staff()

    def create(self, **data):
        return self.client.post(SERVICES, {"key": "web", "icon": "globe", **data}, format="json")

    def test_create_with_translations(self):
        response = self.create(
            status="published",
            translations={
                "en": full_translation("Website Development", capabilities=["A", "B"],
                                       process=[{"title": "Discovery", "description": "Talk"}]),
                "tr": {"title": "Web Sitesi Geliştirme"},
                "ar": {"title": "تطوير مواقع الويب", "summary": "ملخص", "description": "نص"},
            },
        )
        self.assertEqual(response.status_code, 201, response.content)
        body = response.json()
        self.assertEqual(body["translation_status"], {"en": "published", "tr": "incomplete", "ar": "draft"})
        self.assertEqual(body["translations"]["en"]["slug"], "website-development")
        self.assertEqual(body["translations"]["tr"]["slug"], "web-sitesi-gelistirme")
        self.assertEqual(body["translations"]["ar"]["slug"], "تطوير-مواقع-الويب")
        self.assertEqual(body["translations"]["en"]["process"], [{"title": "Discovery", "description": "Talk"}])
        self.assertEqual(body["translations"]["tr"]["status"], "draft")
        for field in ["id", "key", "icon", "status", "is_featured", "sort_order", "created_at", "updated_at"]:
            self.assertIn(field, body)

    def test_missing_languages_are_null(self):
        body = self.create(translations={"en": {"title": "Only English"}}).json()
        self.assertIsNone(body["translations"]["tr"])
        self.assertEqual(body["translation_status"]["tr"], "missing")

    def test_upsert_updates_in_place_and_null_deletes(self):
        service_id = self.create(
            translations={"en": full_translation("Web"), "tr": full_translation("Web TR"), "ar": {"title": "ويب"}}
        ).json()["id"]
        en_pk = ServiceTranslation.objects.get(service_id=service_id, language="en").pk

        response = self.client.patch(
            f"{SERVICES}{service_id}/",
            {"translations": {"en": {"summary": "Updated"}, "tr": None}},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.content)
        body = response.json()
        self.assertEqual(body["translations"]["en"]["summary"], "Updated")
        self.assertEqual(body["translations"]["en"]["title"], "Web")  # untouched field kept
        self.assertIsNone(body["translations"]["tr"])
        self.assertEqual(body["translations"]["ar"]["title"], "ويب")  # omitted language untouched
        rows = ServiceTranslation.objects.filter(service_id=service_id)
        self.assertEqual(sorted(rows.values_list("language", flat=True)), ["ar", "en"])
        self.assertEqual(rows.get(language="en").pk, en_pk)  # updated, not duplicated

        # Re-adding a language creates exactly one row.
        self.client.patch(f"{SERVICES}{service_id}/", {"translations": {"tr": {"title": "Yeni"}}}, format="json")
        self.client.patch(f"{SERVICES}{service_id}/", {"translations": {"tr": {"title": "Yeni 2"}}}, format="json")
        self.assertEqual(rows.filter(language="tr").count(), 1)

    def test_duplicate_slug_error_shape(self):
        make_service("existing", [service_tr("tr", "Web", slug="web-sitesi")])
        response = self.create(translations={"tr": {"title": "Başka", "slug": "web-sitesi"}})
        error = self.assertError(response, 400, "validation_error")
        self.assertEqual(list(error["fields"]), ["translations.tr.slug"])
        self.assertFalse(ServiceTranslation.objects.filter(service__key="web").exists())

    def test_same_slug_allowed_in_other_language(self):
        make_service("existing", [service_tr("tr", "Web", slug="web")])
        self.assertEqual(self.create(translations={"en": {"title": "Web", "slug": "web"}}).status_code, 201)

    def test_auto_slug_is_made_unique(self):
        make_service("existing", [service_tr("en", "Web")])
        body = self.create(translations={"en": {"title": "Web"}}).json()
        self.assertEqual(body["translations"]["en"]["slug"], "web-2")

    def test_invalid_slug_and_language(self):
        error = self.assertError(
            self.create(translations={"en": {"slug": "not a slug!"}, "fr": {"title": "x"}}), 400, "validation_error"
        )
        self.assertIn("translations.en.slug", error["fields"])
        self.assertIn("translations.fr", error["fields"])

    def test_publishing_requires_fields(self):
        error = self.assertError(
            self.create(translations={"en": {"title": "Web", "status": "published"}}), 400, "validation_error"
        )
        self.assertIn("translations.en.summary", error["fields"])
        self.assertIn("translations.en.description", error["fields"])

    def test_nested_process_errors_are_flattened(self):
        error = self.assertError(
            self.create(translations={"en": {"process": [{"title": "ok"}, {"description": "no title"}]}}),
            400,
            "validation_error",
        )
        self.assertIn("translations.en.process.1.title", error["fields"])

    def test_icon_and_key_validation(self):
        error = self.assertError(self.create(icon="rocket"), 400, "validation_error")
        self.assertIn("icon", error["fields"])
        self.create()
        error = self.assertError(self.create(), 400, "validation_error")
        self.assertIn("key", error["fields"])

    def test_list_is_paginated_and_filterable(self):
        make_service("a", [], status="draft")
        make_service("b", [])
        body = self.client.get(SERVICES, {"status": "draft"}).json()
        self.assertEqual(body["count"], 1)
        self.assertEqual(body["results"][0]["key"], "a")

    def test_delete(self):
        service = make_service("gone", [service_tr("en", "Gone")])
        self.assertEqual(self.client.delete(f"{SERVICES}{service.pk}/").status_code, 204)
        self.assertFalse(ServiceTranslation.objects.filter(service_id=service.pk).exists())


class PortfolioAdminTests(BaseAPITestCase):
    def test_create_and_update_relations(self):
        self.login_staff()
        web = make_service("web", [])
        mobile = make_service("mobile", [])
        response = self.client.post(
            "/api/v1/admin/portfolio/",
            {
                "category": web.pk,
                "services": [web.pk, mobile.pk],
                "technologies": ["Django", " django ", "Next.js"],
                "is_demo": True,
                "external_url": "https://example.com",
                "translations": {"en": {"title": "Demo", "summary": "s", "body": "b", "status": "published"}},
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        body = response.json()
        self.assertEqual(body["technologies"], ["Django", "Next.js"])
        self.assertEqual(sorted(body["services"]), sorted([web.pk, mobile.pk]))
        self.assertEqual(body["translation_status"]["en"], "published")
        self.assertIsNone(body["cover_image"])
        self.assertEqual(body["images"], [])

        bad = self.client.patch(
            f"/api/v1/admin/portfolio/{body['id']}/", {"external_url": "javascript:alert(1)"}, format="json"
        )
        self.assertError(bad, 400, "validation_error")
        cleared = self.client.patch(f"/api/v1/admin/portfolio/{body['id']}/", {"category": None}, format="json")
        self.assertIsNone(cleared.json()["category"])


class BlogAdminTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.user = self.login_staff()

    def test_publish_sets_published_at_and_author(self):
        response = self.client.post(
            "/api/v1/admin/blog/posts/",
            {"status": "draft", "translations": {"en": {"title": "Hello"}}},
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        body = response.json()
        self.assertIsNone(body["published_at"])
        self.assertEqual(body["author_name"], "Shamflare Team")
        self.assertEqual(BlogPost.objects.get().author, self.user)

        published = self.client.patch(
            f"/api/v1/admin/blog/posts/{body['id']}/", {"status": "published"}, format="json"
        ).json()
        self.assertIsNotNone(published["published_at"])

        scheduled_at = (timezone.now() + timedelta(days=3)).replace(microsecond=0)
        scheduled = self.client.patch(
            f"/api/v1/admin/blog/posts/{body['id']}/", {"published_at": scheduled_at.isoformat()}, format="json"
        ).json()
        self.assertTrue(scheduled["published_at"].startswith(scheduled_at.strftime("%Y-%m-%dT%H:%M:%S")))

    def test_category_crud(self):
        response = self.client.post(
            "/api/v1/admin/blog/categories/",
            {"sort_order": 2, "translations": {"en": {"name": "Guides"}, "ar": {"name": "أدلة"}}},
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        body = response.json()
        self.assertEqual(body["translations"]["en"], {"name": "Guides", "slug": "guides"})
        self.assertEqual(body["translations"]["ar"]["slug"], "أدلة")
        self.assertEqual(body["translation_status"], {"en": "published", "tr": "missing", "ar": "published"})
        self.assertEqual(self.client.delete(f"/api/v1/admin/blog/categories/{body['id']}/").status_code, 204)


class InquiryAdminTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.login_staff()
        make_service("web", [service_tr("en", "Website Development")])
        self.a = ProjectInquiry.objects.create(
            name="Alice", email="alice@example.com", company="Acme", service="web", description="A" * 30, consent=True
        )
        self.b = ProjectInquiry.objects.create(
            name="Bob", email="bob@example.com", description="Mobile banking idea " * 2, consent=True,
            status="archived", service="other",
        )

    def test_list_filter_search_order(self):
        body = self.client.get("/api/v1/admin/inquiries/").json()
        self.assertEqual([r["name"] for r in body["results"]], ["Bob", "Alice"])
        item = body["results"][1]
        self.assertEqual(item["service_title"], "Website Development")
        self.assertEqual(body["results"][0]["service_title"], "Other")
        self.assertNotIn("ip_hash", item)
        self.assertNotIn("user_agent", item)
        self.assertEqual(
            set(item),
            {"id", "reference", "name", "email", "company", "service", "service_title", "budget", "description",
             "preferred_language", "consent", "status", "internal_notes", "notification_sent_at", "created_at",
             "updated_at"},
        )
        ordered = self.client.get("/api/v1/admin/inquiries/", {"ordering": "created_at"}).json()
        self.assertEqual([r["name"] for r in ordered["results"]], ["Alice", "Bob"])
        archived = self.client.get("/api/v1/admin/inquiries/", {"status": "archived"}).json()
        self.assertEqual([r["name"] for r in archived["results"]], ["Bob"])
        for term in ["acme", "banking", self.a.reference, "bob@"]:
            with self.subTest(term=term):
                self.assertEqual(self.client.get("/api/v1/admin/inquiries/", {"search": term}).json()["count"], 1)
        self.assertError(self.client.get("/api/v1/admin/inquiries/", {"status": "bogus"}), 400, "validation_error")

    def test_patch_only_status_and_notes(self):
        url = f"/api/v1/admin/inquiries/{self.a.pk}/"
        response = self.client.patch(url, {"status": "in_progress", "internal_notes": "Called back"}, format="json")
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()["status"], "in_progress")
        error = self.assertError(self.client.patch(url, {"email": "x@example.com"}, format="json"), 400, "validation_error")
        self.assertIn("email", error["fields"])
        self.assertError(self.client.put(url, {"status": "new"}, format="json"), 405, "method_not_allowed")
        self.assertError(self.client.post("/api/v1/admin/inquiries/", {}, format="json"), 405, "method_not_allowed")
        self.a.refresh_from_db()
        self.assertEqual(self.a.email, "alice@example.com")
        self.assertEqual(self.client.delete(url).status_code, 204)


class SiteSettingsAdminTests(BaseAPITestCase):
    def test_get_and_patch(self):
        self.login_staff()
        body = self.client.get("/api/v1/admin/site-settings/").json()
        self.assertEqual(body["company_name"], "Shamflare")
        response = self.client.patch(
            "/api/v1/admin/site-settings/",
            {
                "whatsapp_number": "+90 534 329 99 18",
                "social_links": [{"label": "GitHub", "url": "https://github.com/example"}],
                "translations": {"tr": {"tagline": "Fikirleri Dijital Ürünlere Dönüştürüyoruz."}},
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.content)
        body = response.json()
        self.assertEqual(body["whatsapp_number"], "905343299918")
        self.assertEqual(body["translations"]["tr"]["tagline"], "Fikirleri Dijital Ürünlere Dönüştürüyoruz.")
        self.assertEqual(SiteSettings.objects.count(), 1)
        for bad in [{"whatsapp_number": "12"}, {"social_links": [{"label": "x", "url": "ftp://x"}]},
                    {"contact_email": "nope"}]:
            with self.subTest(bad=bad):
                self.assertError(self.client.patch("/api/v1/admin/site-settings/", bad, format="json"), 400,
                                 "validation_error")


class StatsTests(BaseAPITestCase):
    def test_stats_reflect_database(self):
        self.login_staff()
        make_service("web", [service_tr("en", "Web")])  # tr, ar missing => 2 gaps
        make_service("draft", [], status="draft")  # drafts are not counted as gaps
        for i, state in enumerate(["new", "new", "in_progress", "completed", "archived"]):
            ProjectInquiry.objects.create(name=f"N{i}", email="n@example.com", description="d" * 30, status=state)
        old = ProjectInquiry.objects.create(name="Old", email="o@example.com", description="d" * 30)
        ProjectInquiry.objects.filter(pk=old.pk).update(created_at=timezone.now() - timedelta(days=30))
        BlogPost.objects.create(status="draft")
        make_user("someone")

        body = self.client.get("/api/v1/admin/stats/").json()
        self.assertEqual(
            body["inquiries"],
            {"total": 6, "new": 3, "in_progress": 1, "completed": 1, "archived": 1, "last_7_days": 5},
        )
        self.assertEqual(body["services"], {"total": 2, "published": 1})
        self.assertEqual(body["portfolio"], {"total": 0, "published": 0})
        self.assertEqual(body["blog"], {"total": 1, "published": 0, "drafts": 1})
        self.assertEqual(body["translations"], {"missing": 2})
        self.assertEqual(len(body["recent_inquiries"]), 5)
        self.assertIn("reference", body["recent_inquiries"][0])
