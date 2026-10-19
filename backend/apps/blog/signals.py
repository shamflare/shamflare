from django.db.models.signals import post_delete
from django.dispatch import receiver

from apps.core.uploads import delete_file_on_commit

from .models import BlogPost


@receiver(post_delete, sender=BlogPost)
def delete_post_cover(sender, instance, **kwargs):
    if instance.cover_image:
        delete_file_on_commit(instance.cover_image.storage, instance.cover_image.name)
