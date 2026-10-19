from django.contrib import admin

from apps.core.admin_utils import TranslationInline, TranslationStatusMixin

from .models import BlogCategory, BlogCategoryTranslation, BlogPost, BlogPostTranslation


class CategoryTranslationInline(TranslationInline):
    model = BlogCategoryTranslation


class PostTranslationInline(TranslationInline):
    model = BlogPostTranslation


@admin.register(BlogCategory)
class BlogCategoryAdmin(TranslationStatusMixin, admin.ModelAdmin):
    list_display = ["__str__", "sort_order", "translation_summary"]
    search_fields = ["translations__name"]
    inlines = [CategoryTranslationInline]


@admin.register(BlogPost)
class BlogPostAdmin(TranslationStatusMixin, admin.ModelAdmin):
    list_display = ["__str__", "category", "status", "published_at", "author", "translation_summary"]
    list_filter = ["status", "category"]
    search_fields = ["translations__title"]
    date_hierarchy = "published_at"
    raw_id_fields = ["author"]
    inlines = [PostTranslationInline]
