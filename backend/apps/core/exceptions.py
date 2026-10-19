"""Uniform error envelope for every API error.

Shape (``fields`` only for validation errors)::

    {"error": {"code": "validation_error", "message": "...", "fields": {"email": ["..."]}}}

Nested serializer errors are flattened to dotted keys, e.g.
``{"translations": {"tr": {"slug": [...]}}}`` -> ``"translations.tr.slug"``.
"""

from __future__ import annotations

import logging

from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.http import Http404, JsonResponse
from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.views import set_rollback

logger = logging.getLogger("apps.core.errors")

ERROR_MESSAGES = {
    "validation_error": "Some of the submitted data is invalid.",
    "not_found": "The requested resource was not found.",
    "not_authenticated": "Authentication credentials were not provided.",
    "permission_denied": "You do not have permission to perform this action.",
    "throttled": "Too many requests. Please try again later.",
    "method_not_allowed": "This method is not allowed for this endpoint.",
    "server_error": "An unexpected error occurred. Please try again later.",
    "bad_request": "The request could not be processed.",
}


def error_payload(code: str, message: str | None = None, fields: dict | None = None) -> dict:
    body: dict = {"code": code, "message": message or ERROR_MESSAGES.get(code, ERROR_MESSAGES["bad_request"])}
    if fields is not None:
        body["fields"] = fields
    return {"error": body}


def json_error(code: str, status_code: int, message: str | None = None) -> JsonResponse:
    return JsonResponse(error_payload(code, message), status=status_code)


def flatten_errors(detail, prefix: str = "") -> dict[str, list[str]]:
    """Flatten DRF error detail (dicts/lists, arbitrarily nested) to dotted keys."""
    flat: dict[str, list[str]] = {}

    def add(key: str, message) -> None:
        flat.setdefault(key or "non_field_errors", []).append(str(message))

    def walk(value, key: str) -> None:
        if isinstance(value, dict):
            for k, v in value.items():
                walk(v, f"{key}.{k}" if key else str(k))
        elif isinstance(value, (list, tuple)):
            if all(not isinstance(v, (dict, list, tuple)) for v in value):
                for v in value:
                    add(key, v)
            else:
                for i, v in enumerate(value):
                    if isinstance(v, (dict, list, tuple)):
                        if v:
                            walk(v, f"{key}.{i}" if key else str(i))
                    else:
                        add(key, v)
        else:
            add(key, value)

    walk(detail, prefix)
    return flat


def _first_message(fields: dict[str, list[str]]) -> str:
    for messages in fields.values():
        if messages:
            return messages[0]
    return ERROR_MESSAGES["validation_error"]


def api_exception_handler(exc, context):
    """DRF ``EXCEPTION_HANDLER`` producing the contract's error envelope."""
    if isinstance(exc, Http404):
        exc = exceptions.NotFound()
    elif isinstance(exc, DjangoPermissionDenied):
        exc = exceptions.PermissionDenied()

    if not isinstance(exc, exceptions.APIException):
        logger.exception("Unhandled API error", exc_info=exc)
        set_rollback()
        return Response(error_payload("server_error"), status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    headers = {}
    if getattr(exc, "auth_header", None):
        headers["WWW-Authenticate"] = exc.auth_header
    if getattr(exc, "wait", None):
        headers["Retry-After"] = str(int(exc.wait))

    if isinstance(exc, exceptions.ValidationError):
        detail = exc.detail if isinstance(exc.detail, dict) else {"non_field_errors": exc.detail}
        fields = flatten_errors(detail)
        payload = error_payload("validation_error", _first_message(fields), fields)
    elif isinstance(exc, (exceptions.NotAuthenticated, exceptions.AuthenticationFailed)):
        payload = error_payload("not_authenticated", str(exc.detail))
    elif isinstance(exc, exceptions.PermissionDenied):
        payload = error_payload("permission_denied", str(exc.detail))
    elif isinstance(exc, exceptions.NotFound):
        payload = error_payload("not_found")
    elif isinstance(exc, exceptions.MethodNotAllowed):
        payload = error_payload("method_not_allowed", str(exc.detail))
    elif isinstance(exc, exceptions.Throttled):
        payload = error_payload("throttled", str(exc.detail))
    elif exc.status_code >= 500:
        logger.error("API error %s: %s", exc.status_code, exc.detail)
        payload = error_payload("server_error")
    else:
        detail = exc.detail if isinstance(exc.detail, str) else None
        payload = error_payload("bad_request", str(detail) if detail else None)

    set_rollback()
    return Response(payload, status=exc.status_code, headers=headers)
