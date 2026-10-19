from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

from apps.core.views import health

admin.site.site_header = "Shamflare operations"
admin.site.site_title = "Shamflare Django admin"
admin.site.index_title = "Internal fallback administration"

urlpatterns = [
    path("api/health/", health, name="health"),
    path("api/v1/", include("config.api_urls")),
    # /admin belongs to the Next.js dashboard; Django admin is the fallback.
    path("django-admin/", admin.site.urls),
]

if settings.DEBUG:
    # In production Caddy serves /media/ directly from the media volume.
    urlpatterns += [
        re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
    ]

handler400 = "apps.core.views.bad_request"
handler403 = "apps.core.views.permission_denied"
handler404 = "apps.core.views.page_not_found"
handler500 = "apps.core.views.server_error"
