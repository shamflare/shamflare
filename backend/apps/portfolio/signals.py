"""Remove stored image files when their database rows are deleted."""

from django.db.models.signals import post_delete
from django.dispatch import receiver

from apps.core.uploads import delete_file_on_commit

from .models import PortfolioImage, PortfolioProject


@receiver(post_delete, sender=PortfolioProject)
def delete_project_cover(sender, instance, **kwargs):
    if instance.cover_image:
        delete_file_on_commit(instance.cover_image.storage, instance.cover_image.name)


@receiver(post_delete, sender=PortfolioImage)
def delete_gallery_image(sender, instance, **kwargs):
    if instance.image:
        delete_file_on_commit(instance.image.storage, instance.image.name)
