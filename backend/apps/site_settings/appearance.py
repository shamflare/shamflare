"""Schema of the site appearance (colors, fonts, type scale, shapes and scroll motion).

The configuration is turned into CSS by the frontend (``frontend/lib/appearance.ts``),
so everything is validated against closed lists here: colors are ``#rrggbb`` only,
fonts and shapes come from fixed choices and numbers are bounded. Keep the key lists
in sync with the frontend.
"""

from __future__ import annotations

import re
from typing import Any

from rest_framework import serializers

THEMES = ("dark", "light")

# Base palette, then optional per-part overrides (empty = follow the palette).
COLOR_KEYS = (
    "bg",
    "surface",
    "fg",
    "muted",
    "accent",
    "accent_2",
    "accent_3",
    "on_accent",
    "header_bg",
    "header_fg",
    "hero_bg",
    "card_bg",
    "button_bg",
    "button_fg",
    "link",
    "footer_bg",
    "footer_fg",
    "whatsapp",
)

FONT_KEYS = (
    # Latin
    "inter",
    "sora",
    "poppins",
    "manrope",
    "plus-jakarta",
    "outfit",
    "space-grotesk",
    "dm-sans",
    "montserrat",
    "lexend",
    "playfair",
    # Arabic (all of them also contain Latin glyphs)
    "ibm-plex-arabic",
    "tajawal",
    "cairo",
    "almarai",
    "noto-kufi",
    "readex",
    "changa",
    "el-messiri",
    "alexandria",
    "rubik",
    "vazirmatn",
    "reem-kufi",
    "mada",
    "zain",
    "baloo-bhaijaan",
    "markazi",
    "amiri",
    "lalezar",
)
FONT_ROLES = ("heading", "body", "arabic_heading", "arabic_body")

BUTTON_SHAPES = ("sharp", "soft", "rounded", "round", "pill")
BUTTON_STYLES = ("solid", "gradient", "outline", "soft")
BUTTON_SIZES = ("compact", "regular", "large")
CARD_CORNERS = ("sharp", "soft", "rounded", "round")
REVEAL_STYLES = ("none", "fade", "rise", "zoom", "blur", "tilt")
REVEAL_SPEEDS = ("gentle", "normal", "brisk")
HEADING_WEIGHTS = (400, 500, 600, 700, 800)
BUTTON_WEIGHTS = (500, 600, 700)

BODY_SCALE = (0.85, 1.25)
HEADING_SCALE = (0.8, 1.3)

HEX_COLOR = re.compile(r"^#[0-9a-fA-F]{6}$")
PRESET = re.compile(r"^[a-z0-9-]{0,40}$")


def default_config() -> dict[str, Any]:
    """The built-in design: every override empty."""
    return {
        "preset": "",
        "colors": {theme: dict.fromkeys(COLOR_KEYS) for theme in THEMES},
        "fonts": dict.fromkeys(FONT_ROLES),
        "text": {"body_scale": 1.0, "heading_scale": 1.0, "heading_weight": 600},
        "buttons": {"shape": "rounded", "style": "solid", "size": "regular", "weight": 500, "glow": True},
        "cards": {"corners": "rounded"},
        "motion": {"reveal": "blur", "speed": "gentle"},
    }


def _object(value: Any, path: str, allowed: tuple[str, ...] | dict) -> dict:
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise serializers.ValidationError({path: ["Expected an object."]})
    unknown = sorted(set(value) - set(allowed))
    if unknown:
        raise serializers.ValidationError({path: [f"Unknown field(s): {', '.join(unknown)[:200]}."]})
    return value


def _choice(value: Any, path: str, choices: tuple, default: Any) -> Any:
    if value is None:
        return default
    if isinstance(value, bool) or value not in choices:
        raise serializers.ValidationError({path: [f"Choose one of: {', '.join(map(str, choices))}."]})
    return value


def _number(value: Any, path: str, bounds: tuple[float, float], default: float) -> float:
    if value is None:
        return default
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not bounds[0] <= value <= bounds[1]:
        raise serializers.ValidationError({path: [f"Enter a number between {bounds[0]} and {bounds[1]}."]})
    return round(float(value), 3)


def normalize_appearance(data: Any) -> dict[str, Any]:
    """Validates a (possibly partial) configuration and returns it complete."""
    config = default_config()
    data = _object(data, "appearance", config)

    preset = data.get("preset") or ""
    if not isinstance(preset, str) or not PRESET.match(preset):
        raise serializers.ValidationError({"preset": ["Invalid preset name."]})
    config["preset"] = preset

    colors = _object(data.get("colors"), "colors", THEMES)
    for theme in THEMES:
        values = _object(colors.get(theme), f"colors.{theme}", COLOR_KEYS)
        for key in COLOR_KEYS:
            value = values.get(key) or None
            if value is not None and (not isinstance(value, str) or not HEX_COLOR.match(value)):
                raise serializers.ValidationError({f"colors.{theme}.{key}": ["Use a hex color such as #67e8f9."]})
            config["colors"][theme][key] = value.lower() if value else None

    fonts = _object(data.get("fonts"), "fonts", FONT_ROLES)
    for role in FONT_ROLES:
        config["fonts"][role] = _choice(fonts.get(role) or None, f"fonts.{role}", FONT_KEYS, None)

    text = _object(data.get("text"), "text", config["text"])
    config["text"] = {
        "body_scale": _number(text.get("body_scale"), "text.body_scale", BODY_SCALE, 1.0),
        "heading_scale": _number(text.get("heading_scale"), "text.heading_scale", HEADING_SCALE, 1.0),
        "heading_weight": _choice(text.get("heading_weight"), "text.heading_weight", HEADING_WEIGHTS, 600),
    }

    buttons = _object(data.get("buttons"), "buttons", config["buttons"])
    glow = buttons.get("glow", True)
    if not isinstance(glow, bool):
        raise serializers.ValidationError({"buttons.glow": ["Expected true or false."]})
    config["buttons"] = {
        "shape": _choice(buttons.get("shape"), "buttons.shape", BUTTON_SHAPES, "rounded"),
        "style": _choice(buttons.get("style"), "buttons.style", BUTTON_STYLES, "solid"),
        "size": _choice(buttons.get("size"), "buttons.size", BUTTON_SIZES, "regular"),
        "weight": _choice(buttons.get("weight"), "buttons.weight", BUTTON_WEIGHTS, 500),
        "glow": glow,
    }

    cards = _object(data.get("cards"), "cards", config["cards"])
    config["cards"] = {"corners": _choice(cards.get("corners"), "cards.corners", CARD_CORNERS, "rounded")}

    motion = _object(data.get("motion"), "motion", config["motion"])
    config["motion"] = {
        "reveal": _choice(motion.get("reveal"), "motion.reveal", REVEAL_STYLES, "blur"),
        "speed": _choice(motion.get("speed"), "motion.speed", REVEAL_SPEEDS, "gentle"),
    }
    return config
