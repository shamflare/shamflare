from __future__ import annotations

from apps.site_settings.models import SiteAppearance

from .helpers import BaseAPITestCase

ADMIN_URL = "/api/v1/admin/appearance/"
PUBLIC_URL = "/api/v1/appearance/"


class AppearanceTests(BaseAPITestCase):
    def test_public_defaults_without_configuration(self):
        response = self.client.get(PUBLIC_URL)
        self.assertEqual(response.status_code, 200, response.content)
        body = response.json()
        self.assertIsNone(body["colors"]["dark"]["accent"])
        self.assertIsNone(body["fonts"]["arabic_body"])
        self.assertEqual(body["buttons"]["shape"], "rounded")
        self.assertEqual(body["text"]["body_scale"], 1.0)
        self.assertEqual(body["motion"], {"reveal": "blur", "speed": "gentle"})

    def test_admin_requires_staff(self):
        self.assertEqual(self.client.get(ADMIN_URL).status_code, 403)
        self.assertEqual(self.client.put(ADMIN_URL, {}, format="json").status_code, 403)

    def test_admin_saves_partial_config_and_public_reflects_it(self):
        self.login_staff()
        payload = {
            "preset": "emerald",
            "colors": {"dark": {"accent": "#34D399", "header_bg": "#0a0f0d"}, "light": {"accent": ""}},
            "fonts": {"arabic_body": "tajawal", "arabic_heading": "cairo"},
            "text": {"body_scale": 1.1, "heading_weight": 700},
            "buttons": {"shape": "pill", "style": "gradient", "glow": False},
        }
        response = self.client.put(ADMIN_URL, payload, format="json")
        self.assertEqual(response.status_code, 200, response.content)
        body = self.client.get(PUBLIC_URL).json()
        self.assertEqual(body["colors"]["dark"]["accent"], "#34d399")
        self.assertIsNone(body["colors"]["light"]["accent"])
        self.assertEqual(body["fonts"]["arabic_body"], "tajawal")
        self.assertEqual(body["buttons"], {"shape": "pill", "style": "gradient", "size": "regular", "weight": 500, "glow": False})
        self.assertEqual(body["cards"]["corners"], "rounded")
        self.assertEqual(SiteAppearance.objects.count(), 1)

    def test_put_empty_object_resets(self):
        self.login_staff()
        self.client.put(ADMIN_URL, {"buttons": {"shape": "pill"}}, format="json")
        self.client.put(ADMIN_URL, {}, format="json")
        self.assertEqual(self.client.get(PUBLIC_URL).json()["buttons"]["shape"], "rounded")

    def test_rejects_anything_that_could_reach_css_unchecked(self):
        self.login_staff()
        bad_payloads = [
            {"colors": {"dark": {"accent": "red;}</style><script>"}}},
            {"colors": {"dark": {"accent": "#fff"}}},
            {"colors": {"dark": {"unknown": "#ffffff"}}},
            {"colors": {"sepia": {}}},
            {"fonts": {"body": "Comic Sans"}},
            {"text": {"body_scale": 3}},
            {"text": {"heading_weight": "bold"}},
            {"buttons": {"shape": "star"}},
            {"buttons": {"glow": "yes"}},
            {"cards": {"corners": True}},
            {"motion": {"reveal": "spin"}},
            {"preset": "<b>"},
            {"extra": 1},
        ]
        for bad in bad_payloads:
            with self.subTest(bad=bad):
                self.assertError(self.client.put(ADMIN_URL, bad, format="json"), 400, "validation_error")

    def test_patch_not_allowed(self):
        self.login_staff()
        self.assertEqual(self.client.patch(ADMIN_URL, {}, format="json").status_code, 405)
