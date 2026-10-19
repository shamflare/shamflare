# Deployment (VPS + Docker Compose)

The stack is provider-neutral: any Linux VPS with Docker Engine and the Compose plugin works
(2 vCPU / 2–4 GB RAM is a comfortable start). Nothing below assumes a provider, IP address or DNS host.

## Topology

- **caddy** — the only service with published ports (80, 443, 443/udp). Obtains and renews Let's Encrypt
  certificates, redirects HTTP→HTTPS and `www`→apex, sets security headers, serves `/media` from the
  uploads volume, proxies `/api`, `/django-admin`, `/static` to Django and everything else to Next.js.
- **frontend** — Next.js production server (`node server.js`, standalone output), non-root.
- **backend** — gunicorn + Django (`config.settings.prod`), non-root; runs migrations on start.
- **db** — PostgreSQL 17 on an `internal` network: no published port, not reachable from the internet
  and not even from the frontend container.

Volumes: `postgres_data` (database), `media` (uploads), `caddy_data` (certificates — keep it).

## 1. Server preparation

1. Create a non-root sudo user, use SSH keys, disable password login.
2. Install Docker Engine and the Compose plugin from Docker's official repository.
3. Firewall: allow only `22/tcp` (ideally from your IP), `80/tcp`, `443/tcp`, `443/udp`.
   ```bash
   sudo ufw default deny incoming && sudo ufw allow OpenSSH && sudo ufw allow 80/tcp \
     && sudo ufw allow 443/tcp && sudo ufw allow 443/udp && sudo ufw enable
   ```
   Docker publishes ports itself; never add a `ports:` entry to the `db` service.
4. Enable automatic security updates (e.g. `unattended-upgrades`).

## 2. DNS for shamflare.com

At whichever DNS provider manages the domain:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | the VPS IPv4 address |
| AAAA | `@` | the VPS IPv6 address (only if the server has one) |
| A / AAAA (or CNAME → `shamflare.com`) | `www` | same as above |

Wait until `dig +short shamflare.com` returns the server address before the first start — Caddy needs it
to obtain certificates. If you do not want `www`, remove the `www.{$SITE_DOMAIN}` block from the Caddyfile.

## 3. Configuration

```bash
git clone https://github.com/shamflare/shamflare.git && cd shamflare
cp .env.example .env && chmod 600 .env
```

Fill in `.env`: `SITE_DOMAIN`, `ACME_EMAIL`, a long random `POSTGRES_PASSWORD` and `DJANGO_SECRET_KEY`
(`python3 -c "import secrets; print(secrets.token_urlsafe(64))"`). The backend refuses to start with a
placeholder secret. Every backend option is documented in `backend/.env.example`.

The application connects as the `POSTGRES_USER` role, which owns only the Shamflare database (least
privilege; it is not a cluster superuser beyond what the official image creates for that database).

## 4. First start

```bash
docker compose build
docker compose up -d
docker compose ps                     # all services healthy
docker compose logs -f caddy          # watch the certificate being issued
```

Then:

```bash
# Optional: honest initial content (services, demo projects, two articles, settings) in en/tr/ar
docker compose exec backend python manage.py seed_content
# Create the administrator — interactive, choose a strong unique password
docker compose exec backend python manage.py createsuperuser
```

There are no default credentials and no public registration. Sign in at `https://shamflare.com/admin`.

**Pre-flight checks**

```bash
docker compose exec backend python manage.py check --deploy   # expects only W008/W021, see backend README
curl -sI https://shamflare.com/en | head -1                    # 200
curl -s https://shamflare.com/api/health/                      # {"status": "ok"}
curl -sI http://shamflare.com | grep -i location               # redirects to https
```

Also run the backend test suite once against PostgreSQL (it has so far only run on SQLite):

```bash
docker compose exec -e DJANGO_SETTINGS_MODULE=config.settings.test backend python manage.py test
```

## 5. Static and media files

- Django's static files are collected into the image at build time and served by WhiteNoise via Caddy.
- Uploads are stored in the `media` volume (`/app/media` in the backend, read-only `/srv/media` in Caddy).
  Uploads are validated as real JPEG/PNG/WebP images, size-limited (`MAX_UPLOAD_MB`) and renamed to UUIDs.

## 6. Backups and restore

Back up both the database and the uploads, keep copies **off the server**, and test a restore.

```bash
# Database (compressed custom format)
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > backup/db-$(date +%F).dump
# Uploads
docker run --rm -v shamflare_media:/data -v "$PWD/backup":/backup alpine \
  tar czf /backup/media-$(date +%F).tar.gz -C /data .
```

Schedule them daily with cron and rotate (e.g. keep 14 daily + 8 weekly); copy to object storage or
another machine.

Restore:

```bash
docker compose stop frontend backend
docker compose exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists' < backup/db-YYYY-MM-DD.dump
docker run --rm -v shamflare_media:/data -v "$PWD/backup":/backup alpine \
  sh -c 'rm -rf /data/* && tar xzf /backup/media-YYYY-MM-DD.tar.gz -C /data'
docker compose start backend frontend
```

## 7. Health checks and logs

- Health: `backend` → `/api/health/` (checks the database), `frontend` → `/robots.txt`, `db` → `pg_isready`.
  `docker compose ps` shows the status; `restart: unless-stopped` restarts crashed services.
- Logs: `docker compose logs -f <service>`. Caddy logs JSON access logs to stdout. Configure log
  rotation for Docker (`/etc/docker/daemon.json`: `"log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "5"}`).
- Optionally add an external uptime monitor for `https://shamflare.com/api/health/`.

## 8. Updates and rollback

```bash
git pull
docker compose build
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > backup/pre-update.dump
docker compose up -d            # backend runs pending migrations on start
```

Rollback: `git checkout <previous tag>` → `docker compose build && docker compose up -d`. Migrations are
not reversed automatically: if the failed release included migrations, restore the `pre-update.dump`
(or run `manage.py migrate <app> <previous_migration>` when the migration is reversible). Tag releases
(`git tag v1.0.0`) so there is always a known-good point to return to.

## 9. Activating email notifications later

Set the SMTP values and `INQUIRY_NOTIFICATION_EMAIL` in `.env`, then `docker compose up -d backend`.
Details and a test procedure: backend README → "Inquiries & email notifications".

## Checklist

- [ ] DNS A/AAAA (and `www`) records point at the VPS
- [ ] Firewall allows only SSH, 80, 443 (tcp+udp)
- [ ] `.env` filled, `chmod 600`, no placeholders left
- [ ] `docker compose up -d` — all services healthy, certificate issued
- [ ] `manage.py check --deploy` reviewed
- [ ] Backend tests pass on PostgreSQL
- [ ] Administrator created; dashboard sign-in works over HTTPS
- [ ] Contact form stores an inquiry visible in the dashboard
- [ ] WhatsApp number/message checked in Site settings
- [ ] Daily database + media backups scheduled, copied off-site, restore tested
- [ ] Docker log rotation configured; uptime monitor on `/api/health/`
- [ ] Release tagged for rollback
