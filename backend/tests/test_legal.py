from __future__ import annotations

from apps.legal.models import LegalDocument

from .helpers import BaseAPITestCase

ADMIN_URL = "/api/v1/admin/legal/{}/"
PUBLIC_URL = "/api/v1/legal/{}/"


class LegalDocumentTests(BaseAPITestCase):
    def test_public_returns_empty_body_before_any_edit(self):
        response = self.client.get(PUBLIC_URL.format("privacy"), {"lang": "ar"})
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json(), {"kind": "privacy", "body": "", "updated_at": None})

    def test_unknown_kind_and_language_are_rejected(self):
        self.assertEqual(self.client.get(PUBLIC_URL.format("cookies")).status_code, 404)
        self.assertEqual(self.client.get(PUBLIC_URL.format("terms"), {"lang": "fr"}).status_code, 400)
        self.login_staff()
        self.assertEqual(self.client.get(ADMIN_URL.format("cookies")).status_code, 404)

    def test_admin_requires_staff(self):
        self.assertEqual(self.client.get(ADMIN_URL.format("privacy")).status_code, 403)
        self.assertEqual(self.client.put(ADMIN_URL.format("privacy"), {}, format="json").status_code, 403)

    def test_admin_saves_per_language_and_public_reflects_it(self):
        self.login_staff()
        payload = {"translations": {"en": {"body": "## Who we are\n\nShamflare."}, "ar": {"body": "## من نحن"}}}
        response = self.client.put(ADMIN_URL.format("terms"), payload, format="json")
        self.assertEqual(response.status_code, 200, response.content)
        body = response.json()
        self.assertEqual(body["translation_status"], {"en": "published", "tr": "missing", "ar": "published"})
        self.assertIsNotNone(body["content_updated_at"])

        public = self.client.get(PUBLIC_URL.format("terms"), {"lang": "ar"}).json()
        self.assertEqual(public["body"], "## من نحن")
        self.assertIsNotNone(public["updated_at"])
        # A language without text falls back to the frontend's built-in document.
        self.assertEqual(self.client.get(PUBLIC_URL.format("terms"), {"lang": "tr"}).json()["body"], "")
        # The privacy document is independent.
        self.assertEqual(self.client.get(PUBLIC_URL.format("privacy"), {"lang": "en"}).json()["body"], "")

    def test_last_updated_moves_only_when_text_changes(self):
        self.login_staff()
        url = ADMIN_URL.format("privacy")
        self.client.put(url, {"translations": {"en": {"body": "Version 1"}}}, format="json")
        first = LegalDocument.objects.get(kind="privacy").content_updated_at

        self.client.put(url, {"translations": {"en": {"body": "Version 1"}}}, format="json")
        self.assertEqual(LegalDocument.objects.get(kind="privacy").content_updated_at, first)

        self.client.put(url, {"translations": {"en": {"body": "Version 2"}}}, format="json")
        self.assertGreater(LegalDocument.objects.get(kind="privacy").content_updated_at, first)

    def test_body_length_is_limited(self):
        self.login_staff()
        response = self.client.put(
            ADMIN_URL.format("privacy"), {"translations": {"en": {"body": "x" * 50_001}}}, format="json"
        )
        self.assertEqual(response.status_code, 400, response.content)
