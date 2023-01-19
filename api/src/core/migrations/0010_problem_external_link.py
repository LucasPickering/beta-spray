# Generated by Django 4.1.2 on 2023-01-19 15:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0009_remove_hold_position_x_remove_hold_position_y_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="problem",
            name="external_link",
            field=models.URLField(
                blank=True, help_text="External link, e.g. to Mountain Project"
            ),
        ),
    ]
