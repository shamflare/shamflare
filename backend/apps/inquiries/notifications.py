"""New-inquiry notifications — the integration boundary for email.

The inquiry is always persisted *before* this module is called, and nothing
here can turn a stored inquiry into a failed request:

* When ``INQUIRY_NOTIFICATION_EMAIL`` is empty (the default) notifications are
  disabled and :func:`notify_new_inquiry` is a no-op returning ``False``.
* When it is set, an email is sent through Django's configured
  ``EMAIL_BACKEND`` (SMTP settings come from ``EMAIL_*`` env vars). On success
  ``notification_sent_at`` is recorded; failures are logged and swallowed.

To activate: set ``INQUIRY_NOTIFICATION_EMAIL``, ``EMAIL_HOST``,
``EMAIL_PORT``, ``EMAIL_HOST_USER``, ``EMAIL_HOST_PASSWORD``,
``EMAIL_USE_TLS``/``EMAIL_USE_SSL`` and ``DEFAULT_FROM_EMAIL`` (see README).
Swapping to a provider SDK/API later only requires changing :func:`_send`.
"""

from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from .models import ProjectInquiry

logger = logging.getLogger(__name__)


def notifications_enabled() -> bool:
    return bool(getattr(settings, "INQUIRY_NOTIFICATION_EMAIL", ""))


def _recipients() -> list[str]:
    return [r.strip() for r in settings.INQUIRY_NOTIFICATION_EMAIL.split(",") if r.strip()]


def _build_message(inquiry: ProjectInquiry) -> tuple[str, str]:
    subject = f"New project inquiry {inquiry.reference}"
    lines = [
        f"Reference: {inquiry.reference}",
        f"Name: {inquiry.name}",
        f"Email: {inquiry.email}",
        f"Company: {inquiry.company or '-'}",
        f"Service: {inquiry.service or '-'}",
        f"Budget: {inquiry.get_budget_display() if inquiry.budget else '-'}",
        f"Preferred language: {inquiry.preferred_language}",
        "",
        inquiry.description,
    ]
    base = getattr(settings, "DASHBOARD_BASE_URL", "").rstrip("/")
    if base:
        lines += ["", f"Open in dashboard: {base}/admin/inquiries/{inquiry.pk}"]
    return subject, "\n".join(lines)


def _send(inquiry: ProjectInquiry) -> None:
    subject, body = _build_message(inquiry)
    send_mail(
        subject,
        body,
        settings.DEFAULT_FROM_EMAIL,
        _recipients(),
        fail_silently=False,
    )


def notify_new_inquiry(inquiry: ProjectInquiry) -> bool:
    """Send the staff notification for ``inquiry``. Returns True if sent."""
    if not notifications_enabled():
        return False
    try:
        _send(inquiry)
    except Exception:
        logger.exception("Failed to send notification for inquiry %s", inquiry.reference)
        return False
    sent_at = timezone.now()
    ProjectInquiry.objects.filter(pk=inquiry.pk).update(notification_sent_at=sent_at)
    inquiry.notification_sent_at = sent_at
    return True
