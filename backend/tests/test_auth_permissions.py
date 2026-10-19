from rest_framework.test import APIClient

from apps.blog.models import BlogCategory, BlogPost
from apps.inquiries.models import ProjectInquiry
from apps.portfolio.models import PortfolioProject
from apps.services.models import Service

from .helpers import BaseAPITestCase, make_category, make_post, make_project, make_service, make_user, service_tr

PASSWORD = "a-strong-test-password"


class SessionAuthTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.staff = make_user("admin", is_staff=True, email="admin@example.com", password=PASSWORD)
        self.csrf_client = APIClient(enforce_csrf_checks=True)

    def csrf_token(self):
        response = self.csrf_client.get("/api/v1/auth/csrf/")
        self.assertEqual(response.status_code, 200)
        token = response.json()["csrfToken"]
        self.assertIn("csrftoken", response.cookies)
        self.assertFalse(response.cookies["csrftoken"]["httponly"])
        return token

    def login(self, username="admin", password=PASSWORD, token=None):
        headers = {"HTTP_X_CSRFTOKEN": token} if token else {}
        return self.csrf_client.post(
            "/api/v1/auth/login/", {"username": username, "password": password}, format="json", **headers
        )

    def test_full_login_me_logout_flow_with_csrf(self):
        # Login without the CSRF header is refused.
        self.csrf_token()
        self.assertError(self.login(), 403, "permission_denied")

        response = self.login(token=self.csrf_token())
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(
            response.json()["user"],
            {"id": self.staff.pk, "username": "admin", "email": "admin@example.com", "first_name": "",
             "last_name": "", "is_staff": True},
        )
        self.assertTrue(response.cookies["sessionid"]["httponly"])
        self.assertEqual(response.cookies["sessionid"]["samesite"], "Lax")

        me = self.csrf_client.get("/api/v1/auth/me/")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()["username"], "admin")

        # Authenticated unsafe requests need the (rotated) CSRF token too.
        self.assertError(self.csrf_client.post("/api/v1/auth/logout/"), 403, "permission_denied")
        self.assertError(
            self.csrf_client.post("/api/v1/admin/services/", {"key": "x"}, format="json"), 403, "permission_denied"
        )
        token = self.csrf_client.cookies["csrftoken"].value
        created = self.csrf_client.post(
            "/api/v1/admin/services/", {"key": "x-service"}, format="json", HTTP_X_CSRFTOKEN=token
        )
        self.assertEqual(created.status_code, 201, created.content)

        logout = self.csrf_client.post("/api/v1/auth/logout/", HTTP_X_CSRFTOKEN=token)
        self.assertEqual(logout.status_code, 204)
        self.assertError(self.csrf_client.get("/api/v1/auth/me/"), 403, "not_authenticated")

    def test_bad_credentials_and_non_staff(self):
        make_user("visitor", password=PASSWORD)
        inactive = make_user("old-admin", is_staff=True, password=PASSWORD)
        inactive.is_active = False
        inactive.save()
        token = self.csrf_token()
        for username, password in [("admin", "wrong-password"), ("visitor", PASSWORD), ("old-admin", PASSWORD), ("ghost", PASSWORD)]:
            with self.subTest(username=username):
                error = self.assertError(self.login(username, password, token), 400, "validation_error")
                self.assertIn("non_field_errors", error["fields"])
        self.assertError(self.csrf_client.get("/api/v1/auth/me/"), 403, "not_authenticated")

    def test_login_is_throttled(self):
        token = self.csrf_token()
        for _ in range(10):
            self.login("admin", "wrong-password", token)
        self.assertError(self.login("admin", PASSWORD, token), 429, "throttled")

    def test_no_registration_endpoint(self):
        self.assertError(self.client.post("/api/v1/auth/register/", {}, format="json"), 404, "not_found")


class AdminPermissionTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.service = make_service("web", [service_tr("en", "Web")])
        self.project = make_project({"en": "P"})
        self.category = make_category({"en": "C"})
        self.post = make_post({"en": "Post"})
        self.inquiry = ProjectInquiry.objects.create(
            name="A", email="a@example.com", description="d" * 30, consent=True
        )

    def endpoints(self):
        return [
            ("get", "/api/v1/admin/stats/"),
            ("get", "/api/v1/admin/site-settings/"),
            ("patch", "/api/v1/admin/site-settings/"),
            ("put", "/api/v1/admin/site-settings/"),
            ("get", "/api/v1/admin/services/"),
            ("post", "/api/v1/admin/services/"),
            ("get", f"/api/v1/admin/services/{self.service.pk}/"),
            ("patch", f"/api/v1/admin/services/{self.service.pk}/"),
            ("put", f"/api/v1/admin/services/{self.service.pk}/"),
            ("delete", f"/api/v1/admin/services/{self.service.pk}/"),
            ("get", "/api/v1/admin/portfolio/"),
            ("post", "/api/v1/admin/portfolio/"),
            ("patch", f"/api/v1/admin/portfolio/{self.project.pk}/"),
            ("delete", f"/api/v1/admin/portfolio/{self.project.pk}/"),
            ("post", f"/api/v1/admin/portfolio/{self.project.pk}/cover/"),
            ("delete", f"/api/v1/admin/portfolio/{self.project.pk}/cover/"),
            ("post", f"/api/v1/admin/portfolio/{self.project.pk}/images/"),
            ("delete", f"/api/v1/admin/portfolio/{self.project.pk}/images/1/"),
            ("get", "/api/v1/admin/blog/categories/"),
            ("post", "/api/v1/admin/blog/categories/"),
            ("delete", f"/api/v1/admin/blog/categories/{self.category.pk}/"),
            ("get", "/api/v1/admin/blog/posts/"),
            ("post", "/api/v1/admin/blog/posts/"),
            ("patch", f"/api/v1/admin/blog/posts/{self.post.pk}/"),
            ("delete", f"/api/v1/admin/blog/posts/{self.post.pk}/"),
            ("post", f"/api/v1/admin/blog/posts/{self.post.pk}/cover/"),
            ("get", "/api/v1/admin/inquiries/"),
            ("get", f"/api/v1/admin/inquiries/{self.inquiry.pk}/"),
            ("patch", f"/api/v1/admin/inquiries/{self.inquiry.pk}/"),
            ("delete", f"/api/v1/admin/inquiries/{self.inquiry.pk}/"),
        ]

    def assert_nothing_changed(self):
        self.assertEqual(Service.objects.count(), 1)
        self.assertEqual(PortfolioProject.objects.count(), 1)
        self.assertEqual(BlogCategory.objects.count(), 1)
        self.assertEqual(BlogPost.objects.count(), 1)
        self.assertEqual(ProjectInquiry.objects.count(), 1)
        self.inquiry.refresh_from_db()
        self.assertEqual(self.inquiry.status, "new")

    def call(self, method, url):
        return getattr(self.client, method)(url, {"status": "archived", "key": "hacked"}, format="json")

    def test_anonymous_gets_not_authenticated(self):
        for method, url in self.endpoints():
            with self.subTest(method=method, url=url):
                self.assertError(self.call(method, url), 403, "not_authenticated")
        self.assert_nothing_changed()

    def test_non_staff_gets_permission_denied(self):
        self.client.force_login(make_user("visitor"))
        for method, url in self.endpoints():
            with self.subTest(method=method, url=url):
                self.assertError(self.call(method, url), 403, "permission_denied")
        self.assert_nothing_changed()

    def test_public_endpoints_are_read_only(self):
        for url in ["/api/v1/services/", "/api/v1/portfolio/", "/api/v1/blog/", "/api/v1/site-settings/",
                    "/api/v1/blog/categories/", "/api/v1/services/web/"]:
            for method in ["post", "put", "patch", "delete"]:
                with self.subTest(method=method, url=url):
                    self.assertError(self.call(method, url), 405, "method_not_allowed")
        self.assertError(self.client.get("/api/v1/inquiries/"), 405, "method_not_allowed")
        self.assert_nothing_changed()

    def test_staff_can_access(self):
        self.login_staff()
        for method, url in self.endpoints():
            if method == "get":
                with self.subTest(url=url):
                    self.assertEqual(self.client.get(url).status_code, 200)
