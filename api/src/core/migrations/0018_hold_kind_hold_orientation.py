# Generated by Django 4.2.3 on 2023-07-29 11:29

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0017_betamove_hold_position_mutually_exclusive"),
    ]

    operations = [
        migrations.AddField(
            model_name="hold",
            name="kind",
            field=models.TextField(
                choices=[
                    ("jug", "Jug"),
                    ("crimp", "Crimp"),
                    ("sloper", "Sloper"),
                    ("pinch", "Pinch"),
                    ("pocket", "Pocket"),
                    ("chip", "Chip"),
                ],
                default="jug",
                help_text="Type/kind of a hold",
            ),
        ),
        migrations.AddField(
            model_name="hold",
            name="orientation",
            field=models.TextField(
                choices=[
                    ("up", "Up"),
                    ("down", "Down"),
                    ("left", "Left"),
                    ("right", "Right"),
                ],
                default="up",
                help_text="Direction the good part of a hold faces (most will be UP)",
            ),
        ),
    ]
