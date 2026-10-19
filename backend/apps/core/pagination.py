from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """``?page=N&page_size=M`` (default 12, max 50)."""

    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50

    def get_next_link(self):
        return self._relative(super().get_next_link())

    def get_previous_link(self):
        return self._relative(super().get_previous_link())

    @staticmethod
    def _relative(url):
        # Behind a proxy the absolute host may be internal; root-relative
        # links are always correct for a same-origin frontend.
        if not url:
            return url
        from urllib.parse import urlsplit, urlunsplit

        parts = urlsplit(url)
        return urlunsplit(("", "", parts.path, parts.query, ""))
