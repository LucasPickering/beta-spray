# Generated by Django 4.0.2 on 2022-03-09 21:15

import django.db.models.constraints
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Beta",
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
                ("name", models.CharField(max_length=30)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="BoulderImage",
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
                ("image", models.ImageField(unique=True, upload_to="boulders")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="Hold",
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
                    "position_x",
                    models.FloatField(
                        help_text="Left-to-right position of the hold within "
                        "the image, 0-1"
                    ),
                ),
                (
                    "position_y",
                    models.FloatField(
                        help_text="Top-to-bottom position of the hold within "
                        "the image, 0-1"
                    ),
                ),
                (
                    "source",
                    models.CharField(
                        choices=[("user", "User"), ("auto", "Auto")],
                        help_text="Source of this image-hold attribution "
                        "(auto or manual)",
                        max_length=4,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "image",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="holds",
                        to="core.boulderimage",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Problem",
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
                ("name", models.CharField(max_length=30)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="ProblemHold",
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
                    "source",
                    models.CharField(
                        choices=[("user", "User"), ("auto", "Auto")],
                        help_text="Source of this problem-hold attribution "
                        "(auto or manual)",
                        max_length=4,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "hold",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="core.hold",
                    ),
                ),
                (
                    "problem",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="core.problem",
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="problem",
            name="holds",
            field=models.ManyToManyField(
                blank=True,
                related_name="problems",
                through="core.ProblemHold",
                to="core.Hold",
            ),
        ),
        migrations.AddField(
            model_name="problem",
            name="image",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="problems",
                to="core.boulderimage",
            ),
        ),
        migrations.CreateModel(
            name="BetaMove",
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
                    "order",
                    models.PositiveIntegerField(
                        help_text="Ordering number of the hold in the beta, "
                        "with 0 as start"
                    ),
                ),
                (
                    "body_part",
                    models.CharField(
                        choices=[
                            ("LH", "Left Hand"),
                            ("RH", "Right Hand"),
                            ("LF", "Left Foot"),
                            ("RF", "Right Foot"),
                        ],
                        help_text="Body part in question",
                        max_length=2,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "beta",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="moves",
                        to="core.beta",
                    ),
                ),
                (
                    "hold",
                    models.ForeignKey(
                        help_text="Optional destination hold for this move",
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="core.hold",
                    ),
                ),
            ],
        ),
        migrations.AddField(
            model_name="beta",
            name="problem",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="betas",
                to="core.problem",
            ),
        ),
        migrations.AddConstraint(
            model_name="betamove",
            constraint=models.UniqueConstraint(
                deferrable=django.db.models.constraints.Deferrable["DEFERRED"],
                fields=("beta", "order"),
                name="beta_order_unique",
            ),
        ),
    ]
