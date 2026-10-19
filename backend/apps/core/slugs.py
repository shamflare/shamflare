"""Slug helpers. Slugs are unique per (language, slug) inside each translation table.

Policy: Latin-script text (English, Turkish) produces ASCII slugs
("Web Sitesi Geliştirme" -> "web-sitesi-gelistirme"); text in other scripts
(Arabic) keeps Unicode slugs via ``slugify(..., allow_unicode=True)``
("الدعم الفني" -> "الدعم-الفني").
"""

from __future__ import annotations

import unicodedata
import uuid

from django.utils.text import slugify

# Characters that do not decompose to ASCII under NFKD.
_LATIN_EXTRA = str.maketrans({"ı": "i", "İ": "I", "ß": "ss", "æ": "ae", "Æ": "AE", "ø": "o", "Ø": "O", "đ": "d", "ł": "l"})


def _folds_to_ascii(ch: str) -> bool:
    return ch == "-" or bool(unicodedata.normalize("NFKD", ch).encode("ascii", "ignore"))


def make_slug(value: str, max_length: int) -> str:
    value = (value or "").translate(_LATIN_EXTRA)
    unicode_slug = slugify(value, allow_unicode=True)
    if all(_folds_to_ascii(ch) for ch in unicode_slug):
        result = slugify(value)
    else:
        result = unicode_slug
    return result[:max_length].strip("-")


def unique_slug(model, language: str, source: str, *, exclude_pk=None, max_length: int = 180) -> str:
    """Build a slug from ``source`` that is unused in ``language`` for ``model``.

    Falls back to a short random slug when ``source`` produces nothing
    (e.g. an empty draft title).
    """
    base = make_slug(source, max_length - 8) or f"item-{uuid.uuid4().hex[:8]}"
    qs = model._default_manager.filter(language=language)
    if exclude_pk is not None:
        qs = qs.exclude(pk=exclude_pk)
    candidate, n = base, 2
    while qs.filter(slug=candidate).exists():
        candidate = f"{base}-{n}"
        n += 1
    return candidate
