"""URL map for /api/v1/ (see docs/api.md)."""

from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import SimpleRouter

from apps.blog.views import (
    CategoryAdminViewSet,
    PostAdminViewSet,
    PublicCategoryListView,
    PublicPostDetailView,
    PublicPostListView,
)
from apps.core.auth_views import CsrfView, LoginView, LogoutView, MeView
from apps.core.stats import AdminStatsView
from apps.inquiries.views import InquiryAdminViewSet, InquiryCreateView
from apps.legal.views import LegalDocumentAdminView, PublicLegalDocumentView
from apps.portfolio.views import ProjectAdminViewSet, PublicProjectDetailView, PublicProjectListView
from apps.services.views import PublicServiceDetailView, PublicServiceListView, ServiceAdminViewSet
from apps.site_settings.views import (
    AppearanceAdminView,
    PublicAppearanceView,
    PublicSiteSettingsView,
    SiteSettingsAdminView,
)

SLUG = "<str:slug>/"

admin_router = SimpleRouter()
admin_router.register("services", ServiceAdminViewSet, basename="admin-service")
admin_router.register("portfolio", ProjectAdminViewSet, basename="admin-portfolio")
admin_router.register("blog/categories", CategoryAdminViewSet, basename="admin-blog-category")
admin_router.register("blog/posts", PostAdminViewSet, basename="admin-blog-post")
admin_router.register("inquiries", InquiryAdminViewSet, basename="admin-inquiry")

admin_urlpatterns = [
    path("stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("site-settings/", SiteSettingsAdminView.as_view(), name="admin-site-settings"),
    path("appearance/", AppearanceAdminView.as_view(), name="admin-appearance"),
    path("legal/<str:kind>/", LegalDocumentAdminView.as_view(), name="admin-legal-document"),
    *admin_router.urls,
]

urlpatterns = [
    # Public
    path("site-settings/", PublicSiteSettingsView.as_view(), name="site-settings"),
    path("appearance/", PublicAppearanceView.as_view(), name="appearance"),
    path("legal/<str:kind>/", PublicLegalDocumentView.as_view(), name="legal-document"),
    path("services/", PublicServiceListView.as_view(), name="service-list"),
    path("services/" + SLUG, PublicServiceDetailView.as_view(), name="service-detail"),
    path("portfolio/", PublicProjectListView.as_view(), name="portfolio-list"),
    path("portfolio/" + SLUG, PublicProjectDetailView.as_view(), name="portfolio-detail"),
    path("blog/categories/", PublicCategoryListView.as_view(), name="blog-category-list"),
    path("blog/", PublicPostListView.as_view(), name="blog-list"),
    path("blog/" + SLUG, PublicPostDetailView.as_view(), name="blog-detail"),
    path("inquiries/", InquiryCreateView.as_view(), name="inquiry-create"),
    # Auth
    path("auth/csrf/", CsrfView.as_view(), name="auth-csrf"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    # Admin (staff only)
    path("admin/", include(admin_urlpatterns)),
    # OpenAPI
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="api-docs"),
]
