"""Container health probe: GET /api/health/ with an allowed Host header.

Exit 0 when the API reports {"status": "ok"}, 1 otherwise. Uses only the
standard library (the slim image has no curl).
"""

import json
import os
import sys
import urllib.request


def main() -> int:
    hosts = [h.strip().lstrip(".") for h in os.environ.get("DJANGO_ALLOWED_HOSTS", "").split(",") if h.strip()]
    host = os.environ.get("HEALTHCHECK_HOST") or (hosts[0] if hosts else "localhost")
    port = os.environ.get("HEALTHCHECK_PORT", "8000")
    request = urllib.request.Request(f"http://127.0.0.1:{port}/api/health/", headers={"Host": host})
    try:
        with urllib.request.urlopen(request, timeout=5) as response:  # noqa: S310 - fixed local URL
            return 0 if json.load(response).get("status") == "ok" else 1
    except Exception:
        return 1


if __name__ == "__main__":
    sys.exit(main())
