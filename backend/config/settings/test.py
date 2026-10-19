"""Settings for the automated test suite.

Uses an in-memory SQLite database unless DATABASE_URL is set (e.g. to run the
suite against PostgreSQL).
"""

import tempfile
from pathlib import Path

from .base import *  # noqa: F403
from .env import env_str

DEBUG = False
SECRET_KEY = "test-only-secret-key-not-for-production-use-0123456789abcdef"
ALLOWED_HOSTS = ["testserver", "localhost"]

if not env_str("DATABASE_URL"):
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
INQUIRY_NOTIFICATION_EMAIL = ""
MEDIA_ROOT = Path(tempfile.mkdtemp(prefix="shamflare-test-media-"))
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}
LOGGING["root"]["level"] = "CRITICAL"  # noqa: F405
LOGGING["loggers"]["apps"]["level"] = "CRITICAL"  # noqa: F405
LOGGING["loggers"]["django.request"]["level"] = "CRITICAL"  # noqa: F405

# Static files are served by runserver/staticfiles locally; WhiteNoise is for production.
MIDDLEWARE = [m for m in MIDDLEWARE if "whitenoise" not in m]  # noqa: F405
