from typing import Any

from django.contrib.auth.models import User
from django.contrib.postgres.functions import RandomUUID
from django.core.management.base import BaseCommand
from django.db.models import TextField
from django.db.models.functions import Cast, Substr


class Command(BaseCommand):
    help = "Anonymize all user data in the current DB"

    def handle(self, **kwargs: Any) -> None:
        User.objects.update(
            # Use an abbreviated UUID, so it fits well in the UI
            username=Substr(Cast(RandomUUID(), TextField()), 1, 8),
            email="",
            password="",
            first_name="",
            last_name="",
        )
