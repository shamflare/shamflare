"""Guarantee the JSON error envelope for every /api/ response.

DRF views already use the envelope (see exceptions.py) and handler404/500
cover production, but some responses are produced outside DRF: unknown URLs
while DEBUG is on (Django's technical 404 page), CommonMiddleware, etc. This
middleware replaces any non-JSON error response under /api/ with the envelope.
With DEBUG on, 500 pages are left untouched so tracebacks stay visible locally.
"""

from __future__ import annotations

from django.conf import settings

from .exceptions import json_error

_STATUS_CODES = {
    400: "bad_request",
    401: "not_authenticated",
    403: "permission_denied",
    404: "not_found",
    405: "method_not_allowed",
    429: "throttled",
}


class ApiJsonErrorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if (
            response.status_code < 400
            or not request.path.startswith("/api/")
            or response.get("Content-Type", "").startswith("application/json")
        ):
            return response
        if response.status_code >= 500:
            if settings.DEBUG:
                return response
            code = "server_error"
        else:
            code = _STATUS_CODES.get(response.status_code, "bad_request")
        replacement = json_error(code, response.status_code)
        for header in ("Allow", "Retry-After", "WWW-Authenticate"):
            if header in response:
                replacement[header] = response[header]
        return replacement
