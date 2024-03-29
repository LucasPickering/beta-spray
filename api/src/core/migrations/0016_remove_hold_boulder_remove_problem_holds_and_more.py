# Generated by Django 4.1.7 on 2023-03-25 13:08

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0015_alter_problem_visibility"),
    ]

    operations = [
        # Needed to alter the table while running queries. Maybe this is a bad
        # idea? Not sure!
        # https://stackoverflow.com/a/60829415/1907353
        migrations.RunSQL(
            "SET CONSTRAINTS ALL IMMEDIATE", "SET CONSTRAINTS ALL DEFERRED"
        ),
        migrations.AddField(
            model_name="hold",
            name="problem",
            field=models.ForeignKey(
                default=None,
                null=True,  # We'll fix this below after setting values
                on_delete=django.db.models.deletion.CASCADE,
                related_name="holds",
                to="core.problem",
            ),
            preserve_default=False,
        ),
        migrations.RunSQL(
            [
                # The UI only allows holds to be attached to one problem, so
                # just grab the first problem for each hold
                "UPDATE core_hold SET problem_id = (SELECT COALESCE(problem_id)"
                "   FROM core_problemhold WHERE hold_id = core_hold.id)",
                # There *shouldn't* be any holds without problems, but there
                # may be because of bugs. We can kill those since they're not
                # visible in the UI anyway
                "DELETE FROM core_hold WHERE problem_id IS NULL",
            ],
            [
                # Reattach to the correct boulder
                "UPDATE core_hold h SET boulder_id = p.boulder_id"
                "   FROM core_problem p WHERE h.problem_id = p.id",
                # Re-create the m2m rows
                "INSERT INTO core_problemhold "
                "   (hold_id, problem_id, source, created_at, updated_at)"
                "   SELECT core_hold.id, core_hold.problem_id,"
                "   'user', NOW(), NOW() FROM core_hold",
            ],
        ),
        migrations.AlterField(
            model_name="hold",
            name="problem",
            field=models.ForeignKey(
                null=False,  # Change this
                on_delete=django.db.models.deletion.CASCADE,
                related_name="holds",
                to="core.problem",
            ),
        ),
        # This is reversible only because we modified the original migration
        # (0001) to make the field nullable
        # https://code.djangoproject.com/ticket/23048
        migrations.RemoveField(
            model_name="hold",
            name="boulder",
        ),
        migrations.RemoveField(
            model_name="problem",
            name="holds",
        ),
        migrations.DeleteModel(
            name="ProblemHold",
        ),
        migrations.RunSQL(
            "SET CONSTRAINTS ALL DEFERRED", "SET CONSTRAINTS ALL IMMEDIATE"
        ),
    ]
