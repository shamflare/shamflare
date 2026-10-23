"""Gunicorn configuration (production). All values overridable via env."""

import os

bind = os.environ.get("GUNICORN_BIND", "0.0.0.0:8000")
workers = int(os.environ.get("GUNICORN_WORKERS", "3"))
threads = int(os.environ.get("GUNICORN_THREADS", "2"))
timeout = int(os.environ.get("GUNICORN_TIMEOUT", "30"))
graceful_timeout = 20
keepalive = 5
max_requests = int(os.environ.get("GUNICORN_MAX_REQUESTS", "1000"))
max_requests_jitter = 100
accesslog = "-"
errorlog = "-"
loglevel = os.environ.get("GUNICORN_LOG_LEVEL", "info")
# Trust X-Forwarded-* only from the reverse proxy network (Caddy on the
# internal Docker network). Django uses SECURE_PROXY_SSL_HEADER/NUM_PROXIES.
forwarded_allow_ips = os.environ.get("GUNICORN_FORWARDED_ALLOW_IPS", "*")
limit_request_line = 8190
# Gunicorn 26+ opens a control socket under $HOME by default; /app is read-only
# for the app user, and nothing here uses the control interface.
control_socket_disable = True
