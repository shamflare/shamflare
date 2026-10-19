from django.apps import AppConfig


class PortfolioConfig(AppConfig):
    name = "apps.portfolio"
    label = "portfolio"
    verbose_name = "Portfolio"

    def ready(self):
        from . import signals  # noqa: F401
