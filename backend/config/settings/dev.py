"""Local development settings. Loads backend/.env if present."""

from pathlib import Path

from .env import load_env_file

load_env_file(Path(__file__).resolve().parent.parent.parent / ".env")

from .base import *  # noqa: E402,F403
from .env import env_bool, env_list, env_str  # noqa: E402

DEBUG = env_bool("DJANGO_DEBUG", True)
SECRET_KEY = env_str("DJANGO_SECRET_KEY") or "dev-only-insecure-key-never-use-in-production"
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", ["localhost", "127.0.0.1", "[::1]"])
CSRF_TRUSTED_ORIGINS = env_list(
    "CSRF_TRUSTED_ORIGINS", ["http://localhost:3000", "http://127.0.0.1:3000"]
)

# Manifest storage needs collectstatic; plain storage is friendlier locally.
STORAGES = {
    **STORAGES,  # noqa: F405
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}

# Without an explicitly configured backend, print emails instead of failing.
if not env_str("EMAIL_BACKEND"):
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Static files are served by runserver/staticfiles locally; WhiteNoise is for production.
MIDDLEWARE = [m for m in MIDDLEWARE if "whitenoise" not in m]  # noqa: F405
