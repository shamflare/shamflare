"""Production settings (behind the Caddy reverse proxy, HTTPS only).

Refuses to start without a real DJANGO_SECRET_KEY and explicit ALLOWED_HOSTS.
"""

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403
from .env import env_bool, env_int, env_str

DEBUG = False

_INSECURE_KEY_MARKERS = ("change-me", "changeme", "replace-me", "django-insecure", "dev-only", "test-only")
if (
    not SECRET_KEY  # noqa: F405
    or len(SECRET_KEY) < 50  # noqa: F405
    or len(set(SECRET_KEY)) < 5  # noqa: F405
    or any(marker in SECRET_KEY.lower() for marker in _INSECURE_KEY_MARKERS)  # noqa: F405
):
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY must be set to a long random value in production. Generate one with: "
        "python -c \"import secrets; print(secrets.token_urlsafe(64))\""
    )
if not ALLOWED_HOSTS:  # noqa: F405
    raise ImproperlyConfigured("DJANGO_ALLOWED_HOSTS must be set in production.")

# TLS terminates at Caddy, which sets X-Forwarded-Proto.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = env_bool("USE_X_FORWARDED_HOST", False)
# Caddy already redirects HTTP->HTTPS. Django-level redirects are off by default
# so internal container-to-container calls (e.g. Next.js SSR -> http://backend:8000)
# are not bounced to https://. Enable if Django is ever exposed without Caddy.
SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", False)
SECURE_REDIRECT_EXEMPT = [r"^api/health/$"]
SECURE_HSTS_SECONDS = env_int("DJANGO_SECURE_HSTS_SECONDS", 31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS", True)
SECURE_HSTS_PRELOAD = env_bool("DJANGO_SECURE_HSTS_PRELOAD", False)
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Throttle counters must be shared across gunicorn workers.
if not env_str("DJANGO_CACHE_BACKEND"):
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.db.DatabaseCache",
            "LOCATION": "django_cache",
        }
    }

# The OpenAPI schema/docs describe the admin API; restrict them to staff.
if not env_bool("API_DOCS_PUBLIC", False):
    SPECTACULAR_SETTINGS = {
        **SPECTACULAR_SETTINGS,  # noqa: F405
        "SERVE_PERMISSIONS": ["rest_framework.permissions.IsAdminUser"],
    }

ADMINS = [("Admin", e) for e in [env_str("DJANGO_ADMIN_EMAIL")] if e]
