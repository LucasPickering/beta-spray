from typing import Any

from django.contrib.auth.models import User
from django.contrib.postgres.functions import RandomUUID
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Anonymize all user data in the current DB"

    def handle(self, **kwargs: Any) -> None:
        User.objects.update(
            username=RandomUUID(),
            email="",
            password="",
            first_name="",
            last_name="",
        )
