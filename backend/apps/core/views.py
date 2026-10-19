"""Health check and Django-level error views (JSON for /api paths)."""

from __future__ import annotations

import logging

from django.db import connection
from django.http import JsonResponse
from django.views import defaults
from django.views.csrf import csrf_failure as default_csrf_failure
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_GET

from .exceptions import json_error

logger = logging.getLogger(__name__)


def _is_api(request) -> bool:
    return request.path.startswith("/api/")


@never_cache
@require_GET
def health(request):
    """Liveness + database connectivity. 200 {"status": "ok"} or 503."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        logger.exception("Health check: database unavailable")
        return JsonResponse({"status": "error", "database": "unavailable"}, status=503)
    return JsonResponse({"status": "ok"})


def bad_request(request, exception=None):
    if _is_api(request):
        return json_error("bad_request", 400)
    return defaults.bad_request(request, exception)


def permission_denied(request, exception=None):
    if _is_api(request):
        return json_error("permission_denied", 403)
    return defaults.permission_denied(request, exception)


def page_not_found(request, exception=None):
    if _is_api(request):
        return json_error("not_found", 404)
    return defaults.page_not_found(request, exception)


def server_error(request):
    if _is_api(request):
        return json_error("server_error", 500)
    return defaults.server_error(request)


def csrf_failure(request, reason=""):
    if _is_api(request):
        return json_error("permission_denied", 403, f"CSRF verification failed: {reason}")
    return default_csrf_failure(request, reason=reason)
