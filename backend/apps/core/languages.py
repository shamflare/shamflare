"""Content locales supported by the CMS (exactly en, tr, ar; en is default)."""

from django.db import models


class Language(models.TextChoices):
    EN = "en", "English"
    TR = "tr", "Türkçe"
    AR = "ar", "العربية"


LANGUAGE_CODES: tuple[str, ...] = tuple(Language.values)
DEFAULT_LANGUAGE = Language.EN.value


def language_order(code: str) -> int:
    return LANGUAGE_CODES.index(code) if code in LANGUAGE_CODES else len(LANGUAGE_CODES)
