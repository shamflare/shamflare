import re

from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings

from apps.portfolio.models import PortfolioImage

from .helpers import BaseAPITestCase, image_upload, make_post, make_project

UUID_NAME = r"[0-9a-f]{32}\.(png|jpg|webp)$"


class UploadTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.login_staff()
        self.project = make_project({"en": "Project"})
        self.cover_url = f"/api/v1/admin/portfolio/{self.project.pk}/cover/"

    def upload(self, url, file, **extra):
        return self.client.post(url, {"file": file, **extra}, format="multipart")

    def stored_name(self, url):
        return url.removeprefix("/media/")

    def test_valid_cover_upload_uses_uuid_name(self):
        response = self.upload(self.cover_url, image_upload("PNG", name="../../evil name.php.png"))
        self.assertEqual(response.status_code, 200, response.content)
        url = response.json()["cover_image"]
        self.assertTrue(url.startswith("/media/portfolio/covers/"))
        self.assertRegex(url, UUID_NAME)
        self.assertNotIn("evil", url)
        self.assertTrue(default_storage.exists(self.stored_name(url)))

    def test_extension_comes_from_content_not_filename(self):
        url = self.upload(self.cover_url, image_upload("JPEG", name="picture.png")).json()["cover_image"]
        self.assertTrue(url.endswith(".jpg"))
        url = self.upload(self.cover_url, image_upload("WEBP", name="x.gif")).json()["cover_image"]
        self.assertTrue(url.endswith(".webp"))

    def test_replacing_and_clearing_deletes_old_files(self):
        with self.captureOnCommitCallbacks(execute=True):
            first = self.upload(self.cover_url, image_upload()).json()["cover_image"]
        with self.captureOnCommitCallbacks(execute=True):
            second = self.upload(self.cover_url, image_upload()).json()["cover_image"]
        self.assertNotEqual(first, second)
        self.assertFalse(default_storage.exists(self.stored_name(first)))
        self.assertTrue(default_storage.exists(self.stored_name(second)))
        with self.captureOnCommitCallbacks(execute=True):
            cleared = self.client.delete(self.cover_url)
        self.assertEqual(cleared.status_code, 200)
        self.assertIsNone(cleared.json()["cover_image"])
        self.assertFalse(default_storage.exists(self.stored_name(second)))

    def test_deleting_project_deletes_files(self):
        with self.captureOnCommitCallbacks(execute=True):
            cover = self.upload(self.cover_url, image_upload()).json()["cover_image"]
        with self.captureOnCommitCallbacks(execute=True):
            self.client.delete(f"/api/v1/admin/portfolio/{self.project.pk}/")
        self.assertFalse(default_storage.exists(self.stored_name(cover)))

    def test_non_image_rejected(self):
        fake = SimpleUploadedFile("photo.png", b"<?php echo 'hi'; ?>" * 10, content_type="image/png")
        error = self.assertError(self.upload(self.cover_url, fake), 400, "validation_error")
        self.assertIn("file", error["fields"])
        self.project.refresh_from_db()
        self.assertFalse(self.project.cover_image)

    def test_disallowed_image_format_rejected(self):
        error = self.assertError(self.upload(self.cover_url, image_upload("GIF", name="a.gif")), 400, "validation_error")
        self.assertIn("file", error["fields"])

    @override_settings(MAX_UPLOAD_MB=1)
    def test_oversize_rejected(self):
        big = SimpleUploadedFile("big.png", b"\x89PNG" + b"0" * (1024 * 1024 + 10), content_type="image/png")
        error = self.assertError(self.upload(self.cover_url, big), 400, "validation_error")
        self.assertIn("1 MB", error["fields"]["file"][0])

    def test_missing_file(self):
        self.assertError(self.client.post(self.cover_url, {}, format="multipart"), 400, "validation_error")

    def test_json_body_rejected_for_upload(self):
        self.assertError(self.client.post(self.cover_url, {"file": "x"}, format="json"), 415, "bad_request")

    def test_gallery_add_and_delete(self):
        url = f"/api/v1/admin/portfolio/{self.project.pk}/images/"
        response = self.upload(url, image_upload(), alt_text="Screenshot")
        self.assertEqual(response.status_code, 200, response.content)
        images = response.json()["images"]
        self.assertEqual(len(images), 1)
        self.assertEqual(images[0]["alt_text"], "Screenshot")
        self.assertRegex(images[0]["url"], r"^/media/portfolio/gallery/" + UUID_NAME)
        stored = self.stored_name(images[0]["url"])

        public = self.client.get("/api/v1/portfolio/project/").json()
        self.assertEqual(public["images"], [{"id": images[0]["id"], "url": images[0]["url"], "alt": "Screenshot"}])

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(f"{url}{images[0]['id']}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["images"], [])
        self.assertFalse(PortfolioImage.objects.exists())
        self.assertFalse(default_storage.exists(stored))
        self.assertError(self.client.delete(f"{url}999/"), 404, "not_found")

    def test_blog_cover(self):
        post = make_post({"en": "Post"})
        response = self.upload(f"/api/v1/admin/blog/posts/{post.pk}/cover/", image_upload())
        self.assertEqual(response.status_code, 200, response.content)
        self.assertTrue(re.match(r"^/media/blog/covers/" + UUID_NAME, response.json()["cover_image"]))
        self.assertEqual(self.client.get("/api/v1/blog/post/").json()["cover_image"], response.json()["cover_image"])
