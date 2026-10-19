# syntax=docker/dockerfile:1
# Shamflare Django API — production image (gunicorn, non-root).

FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DJANGO_SETTINGS_MODULE=config.settings.prod \
    STATIC_ROOT=/app/staticfiles \
    MEDIA_ROOT=/app/media

WORKDIR /app

RUN groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --home-dir /app --shell /usr/sbin/nologin app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=app:app . .

# Collect static files at build time. The throwaway key only satisfies the
# production settings guard; it is never used at runtime.
RUN DJANGO_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(64))')" \
    DJANGO_ALLOWED_HOSTS=build.invalid \
    DATABASE_URL=sqlite:////tmp/build.sqlite3 \
    python manage.py collectstatic --noinput \
    && rm -f /tmp/build.sqlite3 \
    && mkdir -p /app/media \
    && chown -R app:app /app/media /app/staticfiles \
    && chmod +x /app/docker-entrypoint.sh

USER app

EXPOSE 8000
VOLUME ["/app/media"]

HEALTHCHECK --interval=30s --timeout=6s --start-period=30s --retries=3 \
    CMD ["python", "scripts/healthcheck.py"]

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--config", "gunicorn.conf.py"]
