"""Settings shared by every environment.

Environment-specific modules (``dev``, ``prod``, ``test``) import everything
from here and override what they need. Every tunable value is read from the
environment; see ``backend/.env.example`` for the full list.
"""

from __future__ import annotations

from pathlib import Path

import dj_database_url

from .env import env_bool, env_int, env_list, env_str

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # .../backend

# --------------------------------------------------------------------------- #
# Core
# --------------------------------------------------------------------------- #
SECRET_KEY = env_str("DJANGO_SECRET_KEY")
DEBUG = env_bool("DJANGO_DEBUG", False)
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", [])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "corsheaders",
    "rest_framework",
    "django_filters",
    "drf_spectacular",
    # Local apps
    "apps.core",
    "apps.services",
    "apps.portfolio",
    "apps.blog",
    "apps.inquiries",
    "apps.site_settings",
    "apps.legal",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "apps.core.middleware.ApiJsonErrorMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# --------------------------------------------------------------------------- #
# Database — PostgreSQL is the real target; sqlite is a local-only fallback.
# --------------------------------------------------------------------------- #
DATABASES = {
    "default": dj_database_url.parse(
        env_str("DATABASE_URL", "sqlite:///db.sqlite3"),
        conn_max_age=env_int("DATABASE_CONN_MAX_AGE", 60),
        conn_health_checks=True,
    )
}
if DATABASES["default"]["ENGINE"] == "django.db.backends.sqlite3":
    # Relative sqlite paths are resolved against backend/, not the CWD.
    _sqlite_name = Path(str(DATABASES["default"]["NAME"]))
    if str(_sqlite_name) != ":memory:" and not _sqlite_name.is_absolute():
        DATABASES["default"]["NAME"] = BASE_DIR / _sqlite_name
    DATABASES["default"]["CONN_MAX_AGE"] = 0
elif DATABASES["default"]["ENGINE"] == "django.db.backends.postgresql":
    DATABASES["default"].setdefault("OPTIONS", {})
    DATABASES["default"]["OPTIONS"].setdefault("connect_timeout", env_int("DATABASE_CONNECT_TIMEOUT", 5))
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --------------------------------------------------------------------------- #
# Cache (used by DRF throttling). Override with DJANGO_CACHE_BACKEND=db in
# multi-process deployments so throttle counters are shared between workers.
# --------------------------------------------------------------------------- #
_cache_backend = env_str("DJANGO_CACHE_BACKEND", "locmem").lower()
if _cache_backend == "db":
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.db.DatabaseCache",
            "LOCATION": "django_cache",
        }
    }
else:
    CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}

# --------------------------------------------------------------------------- #
# Auth & passwords
# --------------------------------------------------------------------------- #
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --------------------------------------------------------------------------- #
# Sessions & CSRF (dashboard uses session auth + CSRF, same origin)
# --------------------------------------------------------------------------- #
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_AGE = env_int("SESSION_COOKIE_AGE", 60 * 60 * 12)  # 12 hours
CSRF_COOKIE_NAME = "csrftoken"
CSRF_COOKIE_HTTPONLY = False  # the SPA reads it and sends X-CSRFToken
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", [])
CSRF_FAILURE_VIEW = "apps.core.views.csrf_failure"

# CORS — normally unused (same origin). Only listed origins, never "*".
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", [])
CORS_ALLOW_CREDENTIALS = env_bool("CORS_ALLOW_CREDENTIALS", False)
CORS_URLS_REGEX = r"^/api/.*$"

# --------------------------------------------------------------------------- #
# I18N — UI messages are English; content locales live in apps.core.languages
# --------------------------------------------------------------------------- #
LANGUAGE_CODE = "en"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# --------------------------------------------------------------------------- #
# Static & media
# --------------------------------------------------------------------------- #
STATIC_URL = "/static/"
STATIC_ROOT = Path(env_str("STATIC_ROOT", str(BASE_DIR / "staticfiles")))
MEDIA_URL = "/media/"
MEDIA_ROOT = Path(env_str("MEDIA_ROOT", str(BASE_DIR / "media")))

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

MAX_UPLOAD_MB = env_int("MAX_UPLOAD_MB", 5)
# Requests bigger than this (non-file part) are rejected by Django itself.
DATA_UPLOAD_MAX_MEMORY_SIZE = 2_621_440
FILE_UPLOAD_PERMISSIONS = 0o644

# --------------------------------------------------------------------------- #
# Django REST Framework
# --------------------------------------------------------------------------- #
INQUIRY_THROTTLE_RATE = env_str("INQUIRY_THROTTLE_RATE", "5/hour")
LOGIN_THROTTLE_RATE = env_str("LOGIN_THROTTLE_RATE", "10/hour")

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.SessionAuthentication"],
    # Safe default: nothing is accessible unless a view opts in explicitly.
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAdminUser"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PAGINATION_CLASS": "apps.core.pagination.StandardPagination",
    "PAGE_SIZE": 12,
    "DEFAULT_FILTER_BACKENDS": [],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "apps.core.exceptions.api_exception_handler",
    "DEFAULT_THROTTLE_RATES": {
        "inquiries": INQUIRY_THROTTLE_RATE,
        "login": LOGIN_THROTTLE_RATE,
    },
    # Number of trusted reverse proxies in front of Django. 0 = ignore
    # X-Forwarded-For entirely (direct connections). Set to 1 behind Caddy.
    "NUM_PROXIES": env_int("NUM_PROXIES", 0),
    "UNAUTHENTICATED_USER": "django.contrib.auth.models.AnonymousUser",
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Shamflare API",
    "DESCRIPTION": "Public content API and staff-only administration API (v1).",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": r"/api/v1",
    "COMPONENT_SPLIT_REQUEST": True,
    "SERVE_PERMISSIONS": ["rest_framework.permissions.AllowAny"],
    "ENUM_NAME_OVERRIDES": {
        "PublicationStatusEnum": "apps.core.models.PublicationStatus",
        "InquiryStatusEnum": "apps.inquiries.models.InquiryStatus",
        "LanguageEnum": "apps.core.languages.Language",
        "BudgetEnum": "apps.inquiries.models.Budget",
    },
}

# --------------------------------------------------------------------------- #
# Email — prepared, not activated. Notifications are sent only when
# INQUIRY_NOTIFICATION_EMAIL is set (see apps/inquiries/notifications.py).
# --------------------------------------------------------------------------- #
EMAIL_BACKEND = env_str("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = env_str("EMAIL_HOST", "")
EMAIL_PORT = env_int("EMAIL_PORT", 587)
EMAIL_HOST_USER = env_str("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = env_str("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", True)
EMAIL_USE_SSL = env_bool("EMAIL_USE_SSL", False)
EMAIL_TIMEOUT = env_int("EMAIL_TIMEOUT", 10)
DEFAULT_FROM_EMAIL = env_str("DEFAULT_FROM_EMAIL", "Shamflare <no-reply@shamflare.com>")
SERVER_EMAIL = DEFAULT_FROM_EMAIL
INQUIRY_NOTIFICATION_EMAIL = env_str("INQUIRY_NOTIFICATION_EMAIL", "")
# Absolute base URL of the custom dashboard, used for links in notifications.
DASHBOARD_BASE_URL = env_str("DASHBOARD_BASE_URL", "")

# --------------------------------------------------------------------------- #
# Logging — console only; the container runtime collects stdout/stderr.
# --------------------------------------------------------------------------- #
LOG_LEVEL = env_str("DJANGO_LOG_LEVEL", "INFO").upper()
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {"format": "%(asctime)s %(levelname)s %(name)s: %(message)s"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "default"},
    },
    "root": {"handlers": ["console"], "level": LOG_LEVEL},
    "loggers": {
        "django": {"handlers": ["console"], "level": LOG_LEVEL, "propagate": False},
        "django.request": {"handlers": ["console"], "level": "WARNING", "propagate": False},
        "apps": {"handlers": ["console"], "level": LOG_LEVEL, "propagate": False},
    },
}
