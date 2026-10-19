import re
from unittest import mock

from django.core import mail
from django.test import override_settings
from django.utils import timezone

from apps.inquiries.models import ProjectInquiry
from apps.inquiries.views import client_ip_hash

from .helpers import DRAFT, BaseAPITestCase, make_service, service_tr

URL = "/api/v1/inquiries/"


def payload(**overrides):
    data = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "company": "",
        "service": "web",
        "budget": "1k_5k",
        "description": "We need a website for our small bakery with online orders.",
        "preferred_language": "tr",
        "consent": True,
        "website": "",
    }
    data.update(overrides)
    return data


class InquiryValidationTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        make_service("web", [service_tr("en", "Web")])
        make_service("hosting", [service_tr("en", "Hosting")], status=DRAFT)

    def post(self, **overrides):
        return self.client.post(URL, payload(**overrides), format="json")

    def assertRejected(self, field, **overrides):
        error = self.assertError(self.post(**overrides), 400, "validation_error")
        self.assertIn(field, error["fields"])
        self.assertEqual(ProjectInquiry.objects.count(), 0)

    def test_consent_must_be_true(self):
        self.assertRejected("consent", consent=False)
        data = payload()
        del data["consent"]
        error = self.assertError(self.client.post(URL, data, format="json"), 400, "validation_error")
        self.assertIn("consent", error["fields"])

    def test_honeypot_must_be_empty(self):
        self.assertRejected("website", website="http://spam.example")

    def test_description_length(self):
        self.assertRejected("description", description="too short")
        self.assertRejected("description", description="x" * 5001)
        self.assertRejected("description", description="   " + "a" * 10 + "   ")  # trimmed

    def test_required_fields_and_email(self):
        self.assertRejected("name", name="")
        self.assertRejected("email", email="not-an-email")
        self.assertRejected("name", name="n" * 121)
        self.assertRejected("company", company="c" * 161)

    def test_service_values(self):
        self.assertRejected("service", service="does-not-exist")
        self.assertRejected("service", service="hosting")  # draft service is not selectable
        self.assertEqual(self.post(service="other").status_code, 201)
        self.assertEqual(self.post(service="").status_code, 201)

    def test_budget_and_language_choices(self):
        self.assertRejected("budget", budget="1m")
        self.assertRejected("preferred_language", preferred_language="de")

    def test_non_json_body_rejected(self):
        response = self.client.post(URL, "name=x", content_type="application/x-www-form-urlencoded")
        self.assertError(response, 415, "bad_request")


class InquiryPersistenceTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        make_service("web", [service_tr("en", "Web")])

    def test_inquiry_is_stored_with_reference(self):
        response = self.client.post(
            URL, payload(), format="json", HTTP_USER_AGENT="A" * 400, HTTP_X_FORWARDED_FOR="203.0.113.9"
        )
        self.assertEqual(response.status_code, 201, response.content)
        body = response.json()
        self.assertEqual(body["status"], "received")
        inquiry = ProjectInquiry.objects.get()
        self.assertEqual(body["reference"], inquiry.reference)
        self.assertRegex(inquiry.reference, r"^INQ-\d{4}-\d{6}$")
        self.assertEqual(inquiry.reference, f"INQ-{timezone.now().year}-{inquiry.pk:06d}")
        self.assertEqual(inquiry.status, "new")
        self.assertEqual(inquiry.preferred_language, "tr")
        self.assertTrue(inquiry.consent)
        self.assertEqual(len(inquiry.user_agent), 255)
        # Privacy: no raw IP stored; NUM_PROXIES=0 ignores X-Forwarded-For.
        self.assertTrue(re.fullmatch(r"[0-9a-f]{64}", inquiry.ip_hash))
        self.assertNotIn("127.0.0.1", inquiry.ip_hash)
        request = mock.Mock(META={"REMOTE_ADDR": "127.0.0.1"})
        self.assertEqual(inquiry.ip_hash, client_ip_hash(request))
        self.assertIsNone(inquiry.notification_sent_at)
        self.assertEqual(len(mail.outbox), 0)

    def test_references_are_unique(self):
        refs = {self.client.post(URL, payload(), format="json").json()["reference"] for _ in range(3)}
        self.assertEqual(len(refs), 3)

    def test_throttled_after_rate_limit(self):
        for _ in range(5):
            self.assertEqual(self.client.post(URL, payload(), format="json").status_code, 201)
        response = self.client.post(URL, payload(), format="json")
        self.assertError(response, 429, "throttled")
        self.assertIn("Retry-After", response)
        self.assertEqual(ProjectInquiry.objects.count(), 5)


class InquiryNotificationTests(BaseAPITestCase):
    @override_settings(INQUIRY_NOTIFICATION_EMAIL="team@example.com")
    def test_notification_sent_when_configured(self):
        response = self.client.post(URL, payload(service=""), format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(response.json()["reference"], mail.outbox[0].subject)
        self.assertEqual(mail.outbox[0].to, ["team@example.com"])
        self.assertIsNotNone(ProjectInquiry.objects.get().notification_sent_at)

    @override_settings(INQUIRY_NOTIFICATION_EMAIL="team@example.com")
    def test_email_failure_does_not_break_submission(self):
        with mock.patch("apps.inquiries.notifications.send_mail", side_effect=OSError("SMTP down")):
            response = self.client.post(URL, payload(service=""), format="json")
        self.assertEqual(response.status_code, 201)
        inquiry = ProjectInquiry.objects.get()
        self.assertEqual(response.json()["reference"], inquiry.reference)
        self.assertIsNone(inquiry.notification_sent_at)

    def test_hook_crash_does_not_break_submission(self):
        with mock.patch("apps.inquiries.views.notify_new_inquiry", side_effect=RuntimeError("boom")):
            response = self.client.post(URL, payload(service=""), format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ProjectInquiry.objects.count(), 1)

    def test_no_email_when_not_configured(self):
        self.client.post(URL, payload(service=""), format="json")
        self.assertEqual(len(mail.outbox), 0)
        self.assertIsNone(ProjectInquiry.objects.get().notification_sent_at)
