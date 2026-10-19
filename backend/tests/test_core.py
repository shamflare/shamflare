from io import StringIO
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db.utils import OperationalError
from django.test import SimpleTestCase, override_settings

from apps.blog.models import BlogCategory, BlogPost, BlogPostTranslation
from apps.core.exceptions import flatten_errors
from apps.core.slugs import make_slug
from apps.portfolio.models import PortfolioProject, PortfolioProjectTranslation
from apps.services.models import Service, ServiceTranslation
from apps.site_settings.models import SiteSettings, SiteSettingsTranslation

from .helpers import BaseAPITestCase


class HealthTests(BaseAPITestCase):
    def test_health_ok(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_health_reports_database_failure(self):
        with mock.patch("apps.core.views.connection.cursor", side_effect=OperationalError("down")):
            response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["status"], "error")


class ErrorEnvelopeTests(BaseAPITestCase):
    def test_unknown_api_url_is_json_404(self):
        self.assertError(self.client.get("/api/v1/does-not-exist/"), 404, "not_found")
        self.assertError(self.client.get("/api/nothing"), 404, "not_found")

    @override_settings(DEBUG=True)
    def test_unknown_api_url_is_json_even_in_debug(self):
        self.assertError(self.client.get("/api/v1/does-not-exist/"), 404, "not_found")

    def test_method_not_allowed(self):
        response = self.client.delete("/api/v1/services/")
        error = self.assertError(response, 405, "method_not_allowed")
        self.assertNotIn("fields", error)

    def test_malformed_json(self):
        response = self.client.post("/api/v1/inquiries/", "{bad json", content_type="application/json")
        self.assertError(response, 400, "bad_request")

    def test_unhandled_exception_is_server_error_without_details(self):
        with mock.patch("apps.services.views.public_services", side_effect=RuntimeError("secret internals")):
            response = self.client.get("/api/v1/services/")
        self.assertError(response, 500, "server_error")
        self.assertNotIn("secret", response.content.decode())

    def test_non_api_404_is_not_json(self):
        response = self.client.get("/not-api/")
        self.assertEqual(response.status_code, 404)
        self.assertNotIn("application/json", response["Content-Type"])

    def test_schema_and_docs(self):
        self.assertEqual(self.client.get("/api/v1/schema/").status_code, 200)
        self.assertEqual(self.client.get("/api/v1/docs/").status_code, 200)

    def test_django_admin_is_mounted_at_django_admin(self):
        self.assertEqual(self.client.get("/django-admin/login/").status_code, 200)
        self.assertEqual(self.client.get("/admin/").status_code, 404)


class FlattenErrorsTests(SimpleTestCase):
    def test_flatten(self):
        detail = {
            "email": ["Invalid."],
            "translations": {"tr": {"slug": ["Taken."]}},
            "process": [{}, {"title": ["Required."]}],
        }
        self.assertEqual(
            flatten_errors(detail),
            {"email": ["Invalid."], "translations.tr.slug": ["Taken."], "process.1.title": ["Required."]},
        )


class SlugTests(SimpleTestCase):
    def test_slug_policy(self):
        self.assertEqual(make_slug("Yazılım Projesi Brifi Nasıl Hazırlanır?", 100), "yazilim-projesi-brifi-nasil-hazirlanir")
        self.assertEqual(make_slug("Web Sitesi Geliştirme", 100), "web-sitesi-gelistirme")
        self.assertEqual(make_slug("Website & App", 100), "website-app")
        self.assertEqual(make_slug("الدعم الفني والصيانة", 100), "الدعم-الفني-والصيانة")
        self.assertEqual(make_slug("", 100), "")


class SeedCommandTests(BaseAPITestCase):
    def counts(self):
        return {
            model.__name__: model.objects.count()
            for model in [
                Service, ServiceTranslation, PortfolioProject, PortfolioProjectTranslation, BlogCategory,
                BlogPost, BlogPostTranslation, SiteSettings, SiteSettingsTranslation, get_user_model(),
            ]
        }

    def test_seed_is_idempotent_and_honest(self):
        call_command("seed_content", stdout=StringIO())
        first = self.counts()
        call_command("seed_content", stdout=StringIO())
        self.assertEqual(self.counts(), first)
        self.assertEqual(first["User"], 0)
        self.assertEqual(first["Service"], 5)
        self.assertEqual(first["ServiceTranslation"], 13)
        self.assertEqual(first["PortfolioProject"], 3)
        self.assertEqual(first["BlogPost"], 2)
        self.assertEqual(first["SiteSettingsTranslation"], 3)
        self.assertTrue(all(p.is_demo for p in PortfolioProject.objects.all()))

        for lang in ["en", "tr", "ar"]:
            with self.subTest(lang=lang):
                services = self.client.get("/api/v1/services/", {"lang": lang}).json()
                self.assertEqual(
                    [s["key"] for s in services["results"]],
                    ["website-development", "mobile-app-development", "desktop-application-development",
                     "technical-support-maintenance"],
                )  # hosting stays private
                self.assertEqual(self.client.get("/api/v1/portfolio/", {"lang": lang}).json()["count"], 3)
                self.assertEqual(self.client.get("/api/v1/blog/", {"lang": lang}).json()["count"], 2)
                for service in services["results"]:
                    detail = self.client.get(f"/api/v1/services/{service['slug']}/", {"lang": lang}).json()
                    self.assertGreaterEqual(len(detail["capabilities"]), 4)
                    self.assertEqual(len(detail["process"]), 4)
                    self.assertTrue(detail["seo_title"] and detail["seo_description"])
                    self.assertEqual(len(detail["available_languages"]), 3)
                settings = self.client.get("/api/v1/site-settings/", {"lang": lang}).json()
                self.assertTrue(settings["tagline"])
                self.assertTrue(settings["whatsapp_url"].startswith("https://wa.me/905343299918?text="))
        self.assertError(self.client.get("/api/v1/services/hosting/"), 404, "not_found")

    def test_seed_does_not_overwrite_edits(self):
        call_command("seed_content", stdout=StringIO())
        ServiceTranslation.objects.filter(language="en", slug="website-development").update(title="Edited")
        call_command("seed_content", stdout=StringIO())
        self.assertEqual(ServiceTranslation.objects.get(language="en", slug="website-development").title, "Edited")
