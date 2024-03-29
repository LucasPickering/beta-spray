# Generated by Django 4.2 on 2023-06-18 23:20

import django.db.models.deletion
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import migrations, models
from django.db.backends.base.schema import BaseDatabaseSchemaEditor
from django.db.migrations.state import StateApps


def create_profiles(
    apps: StateApps, schema_editor: BaseDatabaseSchemaEditor
) -> None:
    """Create a profile for every existing user, and set is_guest"""
    User = get_user_model()
    UserProfile = apps.get_model("bs_auth", "UserProfile")
    try:
        Guest = apps.get_model("guest_user", "Guest")
        UserProfile.objects.bulk_create(
            [
                UserProfile(
                    user_id=user.id,
                    # Copy over is_guest from the guest_user package
                    is_guest=Guest.objects.filter(user_id=user.id).exists(),
                )
                for user in User.objects.all()
            ]
        )
    except LookupError:
        # guest_user isn't installed - this is probably being run _after_ the
        # app was deleted, so there's no data to migrate anyway
        pass


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="UserProfile",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "is_guest",
                    models.BooleanField(
                        default=False,
                        help_text="Is the user *not* fully authenticated?",
                    ),
                ),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="profile",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.RunPython(
            create_profiles,
            # Reversal is a no-op because the table gets dropped
            reverse_code=lambda *args: None,
        ),
    ]
