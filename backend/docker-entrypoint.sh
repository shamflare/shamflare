#!/bin/sh
# Container entrypoint: optional migrations, then exec the given command.
set -eu

if [ "${DJANGO_RUN_MIGRATIONS:-1}" = "1" ]; then
    python manage.py migrate --noinput
    # Shared cache table used for API throttling across gunicorn workers.
    python manage.py createcachetable
fi

exec "$@"
