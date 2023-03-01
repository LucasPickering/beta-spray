# Generated by Django 4.1.7 on 2023-03-04 00:21

import core.fields
from django.db import migrations, models
import django.db.models.deletion
from core.models import BetaMove


def set_is_start(apps, schema_editor):
    """
    Initialize the is_start field for all beta moves
    """
    BetaMove.objects.update(is_start=BetaMove.get_is_start_expression())


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0012_alter_betamove_order"),
    ]

    operations = [
        migrations.AddField(
            model_name="betamove",
            name="is_start",
            field=models.BooleanField(
                default=False,
                editable=False,
                blank=True,
                help_text="Is this move part of the beta's starting body"
                " position? Calculated automatically whenever a beta is"
                " modified.",
            ),
            preserve_default=False,
        ),
        migrations.RunPython(set_is_start, lambda *args: None),
        migrations.AlterField(
            model_name="betamove",
            name="hold",
            field=models.ForeignKey(
                blank=True,
                help_text="Destination hold for this move. Mutually exclusive"
                " with `position`.",
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="core.hold",
            ),
        ),
        migrations.AlterField(
            model_name="betamove",
            name="order",
            field=core.fields.MoveOrderField(
                blank=True,
                db_index=True,
                help_text="Ordering number of the hold in the beta, starting at"
                " 1",
            ),
        ),
        migrations.AlterField(
            model_name="betamove",
            name="position",
            field=core.fields.BoulderPositionField(
                blank=True,
                help_text="Position of the move, if not attached to a hold."
                " Mutually exclusive with `hold`.",
                null=True,
            ),
        ),
    ]