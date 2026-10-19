from datetime import timedelta

from django.utils import timezone

from apps.site_settings.models import SiteSettings, SiteSettingsTranslation

from .helpers import DRAFT, BaseAPITestCase, make_category, make_post, make_project, make_service, service_tr


class LanguageParameterTests(BaseAPITestCase):
    def test_unknown_language_is_rejected_on_every_public_endpoint(self):
        for url in [
            "/api/v1/site-settings/",
            "/api/v1/services/",
            "/api/v1/portfolio/",
            "/api/v1/blog/",
            "/api/v1/blog/categories/",
        ]:
            with self.subTest(url=url):
                error = self.assertError(self.client.get(url, {"lang": "de"}), 400, "validation_error")
                self.assertIn("lang", error["fields"])

    def test_default_language_is_english(self):
        make_service("web", [service_tr("en", "Web"), service_tr("tr", "Web TR")])
        results = self.client.get("/api/v1/services/").json()["results"]
        self.assertEqual(results[0]["title"], "Web")

    def test_invalid_featured_value(self):
        self.assertError(self.client.get("/api/v1/services/", {"featured": "maybe"}), 400, "validation_error")


class ServiceVisibilityTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.visible = make_service(
            "web",
            [service_tr("en", "Web"), service_tr("tr", "Web Sitesi"), service_tr("ar", "مواقع", status=DRAFT)],
            sort_order=1,
            is_featured=True,
        )
        self.draft_parent = make_service("hosting", [service_tr("en", "Hosting")], status=DRAFT, sort_order=2)
        self.en_only = make_service("mobile", [service_tr("en", "Mobile")], sort_order=3)

    def keys(self, lang, **params):
        response = self.client.get("/api/v1/services/", {"lang": lang, **params})
        self.assertEqual(response.status_code, 200)
        return [item["key"] for item in response.json()["results"]]

    def test_list_respects_parent_and_translation_status(self):
        self.assertEqual(self.keys("en"), ["web", "mobile"])
        self.assertEqual(self.keys("tr"), ["web"])
        self.assertEqual(self.keys("ar"), [])  # draft translation and missing translation

    def test_featured_filter(self):
        self.assertEqual(self.keys("en", featured="true"), ["web"])
        self.assertEqual(self.keys("en", featured="false"), ["mobile"])

    def test_detail_404_when_not_visible(self):
        self.assertError(self.client.get("/api/v1/services/hosting/"), 404, "not_found")  # draft parent
        self.assertError(self.client.get("/api/v1/services/mobile/", {"lang": "tr"}), 404, "not_found")  # missing
        ar_slug = self.visible.translations.get(language="ar").slug
        self.assertError(self.client.get(f"/api/v1/services/{ar_slug}/", {"lang": "ar"}), 404, "not_found")

    def test_slug_is_resolved_in_the_requested_language_only(self):
        self.assertEqual(self.client.get("/api/v1/services/web-sitesi/", {"lang": "tr"}).status_code, 200)
        self.assertError(self.client.get("/api/v1/services/web-sitesi/", {"lang": "en"}), 404, "not_found")

    def test_detail_shape_and_available_languages(self):
        body = self.client.get("/api/v1/services/web/", {"lang": "en"}).json()
        for field in [
            "id", "key", "icon", "slug", "title", "summary", "is_featured", "sort_order", "description",
            "capabilities", "use_cases", "process", "seo_title", "seo_description", "related_projects",
            "available_languages",
        ]:
            self.assertIn(field, body)
        self.assertEqual(
            body["available_languages"],
            [{"language": "en", "slug": "web"}, {"language": "tr", "slug": "web-sitesi"}],
        )

    def test_related_projects_only_visible_ones(self):
        make_project({"en": "Shown"}, category=self.visible)
        make_project({"en": "Via M2M"}, services=[self.visible])
        make_project({"en": "Draft"}, category=self.visible, status=DRAFT)
        make_project({"tr": "Only TR"}, category=self.visible)
        body = self.client.get("/api/v1/services/web/").json()
        self.assertEqual(sorted(p["title"] for p in body["related_projects"]), ["Shown", "Via M2M"])

    def test_unicode_slug_lookup(self):
        service = make_service("support", [service_tr("ar", "الدعم الفني")])
        slug = service.translations.get().slug
        self.assertEqual(slug, "الدعم-الفني")
        self.assertEqual(self.client.get(f"/api/v1/services/{slug}/", {"lang": "ar"}).status_code, 200)


class PortfolioTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.web = make_service("web", [service_tr("en", "Web")])
        self.hidden = make_service("desk", [service_tr("en", "Desk")], status=DRAFT)

    def test_category_null_when_service_not_visible_in_locale(self):
        make_project({"en": "A", "tr": "A tr"}, category=self.web)
        en = self.client.get("/api/v1/portfolio/").json()["results"][0]
        self.assertEqual(en["category"], {"key": "web", "slug": "web", "title": "Web"})
        tr = self.client.get("/api/v1/portfolio/", {"lang": "tr"}).json()["results"][0]
        self.assertIsNone(tr["category"])

    def test_service_and_featured_filters(self):
        make_project({"en": "Web one"}, category=self.web, is_featured=True)
        make_project({"en": "Other"}, category=self.hidden)
        make_project({"en": "Web m2m"}, services=[self.web])
        titles = lambda **p: sorted(i["title"] for i in self.client.get("/api/v1/portfolio/", p).json()["results"])  # noqa: E731
        self.assertEqual(titles(service="web"), ["Web m2m", "Web one"])
        self.assertEqual(titles(featured="true"), ["Web one"])
        self.assertEqual(titles(service="unknown"), [])

    def test_visibility_and_detail(self):
        make_project({"en": "Draft parent"}, status=DRAFT)
        make_project({"en": "Draft translation"}, tr_status=DRAFT)
        project = make_project({"en": "Visible"}, services=[self.web, self.hidden], is_demo=True)
        results = self.client.get("/api/v1/portfolio/").json()["results"]
        self.assertEqual([r["title"] for r in results], ["Visible"])
        self.assertError(self.client.get("/api/v1/portfolio/draft-parent/"), 404, "not_found")
        self.assertError(self.client.get("/api/v1/portfolio/draft-translation/"), 404, "not_found")
        detail = self.client.get("/api/v1/portfolio/visible/").json()
        self.assertEqual(detail["id"], project.pk)
        self.assertTrue(detail["is_demo"])
        self.assertEqual(detail["services"], [{"key": "web", "slug": "web", "title": "Web"}])
        self.assertEqual(detail["images"], [])
        self.assertIsNone(detail["cover_image"])

    def test_pagination_shape(self):
        for i in range(3):
            make_project({"en": f"P{i}"})
        body = self.client.get("/api/v1/portfolio/", {"page_size": 2}).json()
        self.assertEqual(body["count"], 3)
        self.assertEqual(len(body["results"]), 2)
        self.assertTrue(body["next"].startswith("/api/v1/portfolio/"))
        self.assertIsNone(body["previous"])
        self.assertError(self.client.get("/api/v1/portfolio/", {"page": 99}), 404, "not_found")


class BlogTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.category = make_category({"en": "Guides", "tr": "Rehberler"})
        self.post = make_post({"en": "Visible post", "tr": "Görünür yazı"}, category=self.category)
        make_post({"en": "Future post"}, published_at=timezone.now() + timedelta(days=2), category=self.category)
        make_post({"en": "Draft post"}, status=DRAFT, category=self.category)
        make_post({"en": "Draft translation"}, tr_status=DRAFT, category=self.category)

    def test_only_visible_posts_listed(self):
        results = self.client.get("/api/v1/blog/").json()["results"]
        self.assertEqual([r["title"] for r in results], ["Visible post"])
        item = results[0]
        self.assertEqual(item["author_name"], "Shamflare Team")
        self.assertEqual(item["reading_time_minutes"], 3)
        self.assertEqual(item["category"], {"slug": "guides", "name": "Guides"})
        self.assertTrue(item["published_at"].endswith("Z"))

    def test_future_and_draft_details_are_404(self):
        for slug in ["future-post", "draft-post", "draft-translation"]:
            self.assertError(self.client.get(f"/api/v1/blog/{slug}/"), 404, "not_found")
        detail = self.client.get("/api/v1/blog/gorunur-yazi/", {"lang": "tr"}).json()
        self.assertEqual(detail["title"], "Görünür yazı")
        for field in ["body", "seo_title", "seo_description", "updated_at"]:
            self.assertIn(field, detail)

    def test_categories_counts_and_locale(self):
        en = self.client.get("/api/v1/blog/categories/").json()
        self.assertEqual(en, [{"id": self.category.pk, "slug": "guides", "name": "Guides", "post_count": 1}])
        self.assertEqual(self.client.get("/api/v1/blog/categories/", {"lang": "ar"}).json(), [])

    def test_category_filter_uses_localized_slug(self):
        tr = self.client.get("/api/v1/blog/", {"lang": "tr", "category": "rehberler"}).json()
        self.assertEqual(tr["count"], 1)
        self.assertEqual(self.client.get("/api/v1/blog/", {"lang": "tr", "category": "guides"}).json()["count"], 0)

    def test_author_full_name(self):
        from .helpers import make_user

        self.post.author = make_user("writer", first_name="Ada", last_name="Lovelace")
        self.post.save()
        self.assertEqual(self.client.get("/api/v1/blog/visible-post/").json()["author_name"], "Ada Lovelace")


class SiteSettingsTests(BaseAPITestCase):
    def test_public_settings(self):
        settings = SiteSettings.load()
        settings.whatsapp_number = "905343299918"
        settings.save()
        SiteSettingsTranslation.objects.create(
            settings=settings, language="en", tagline="Tag", whatsapp_message="Hello there & welcome"
        )
        en = self.client.get("/api/v1/site-settings/").json()
        self.assertEqual(en["tagline"], "Tag")
        self.assertEqual(en["whatsapp_url"], "https://wa.me/905343299918?text=Hello%20there%20%26%20welcome")
        tr = self.client.get("/api/v1/site-settings/", {"lang": "tr"}).json()
        self.assertEqual(tr["tagline"], "")
        self.assertEqual(tr["whatsapp_url"], "https://wa.me/905343299918")
        self.assertEqual(
            set(en),
            {
                "company_name", "tagline", "hero_title", "hero_subtitle", "about_intro", "about_body",
                "contact_email", "whatsapp_number", "whatsapp_message", "whatsapp_url", "social_links",
            },
        )

    def test_no_number_gives_empty_url(self):
        self.assertEqual(self.client.get("/api/v1/site-settings/").json()["whatsapp_url"], "")
