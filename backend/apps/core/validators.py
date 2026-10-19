"""Model-level validators for JSON fields (used by Django admin forms).

The REST API validates the same structures with serializers; these keep the
Django admin fallback from storing malformed data.
"""

from __future__ import annotations

from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.utils.deconstruct import deconstructible


@deconstructible
class StringListValidator:
    def __init__(self, max_items: int = 30, max_length: int = 200):
        self.max_items = max_items
        self.max_length = max_length

    def __call__(self, value):
        if not isinstance(value, list) or not all(isinstance(v, str) for v in value):
            raise ValidationError("Enter a list of strings.")
        if len(value) > self.max_items:
            raise ValidationError(f"At most {self.max_items} items are allowed.")
        if any(len(v) > self.max_length for v in value):
            raise ValidationError(f"Each item must be at most {self.max_length} characters.")

    def __eq__(self, other):
        return (
            isinstance(other, StringListValidator)
            and other.max_items == self.max_items
            and other.max_length == self.max_length
        )


def validate_process_steps(value) -> None:
    if not isinstance(value, list):
        raise ValidationError('Enter a list of {"title", "description"} objects.')
    for step in value:
        if (
            not isinstance(step, dict)
            or not isinstance(step.get("title"), str)
            or not step["title"].strip()
            or not isinstance(step.get("description", ""), str)
            or set(step) - {"title", "description"}
        ):
            raise ValidationError('Each step must be {"title": "...", "description": "..."} with a title.')


def validate_social_links(value) -> None:
    if not isinstance(value, list):
        raise ValidationError('Enter a list of {"label", "url"} objects.')
    url_validator = URLValidator(schemes=["http", "https"])
    for link in value:
        if not isinstance(link, dict) or not isinstance(link.get("label"), str) or not link["label"].strip():
            raise ValidationError('Each link must be {"label": "...", "url": "https://..."}.')
        url_validator(link.get("url", ""))
