import os.path

from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand

from core.models import Boulder, Problem


class Command(BaseCommand):
    help = (
        "Remove orphaned boulder DB rows and boulder images. A boulder is"
        " orphaned if it no longer has any problems. An image is orphaned if no"
        " boulder references it. Both of these will typically be deleted"
        " automatically upon deletion of the referencing row, so this command"
        " serves as a manual backup."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Don't actually delete anything",
        )
        parser.add_argument(
            "--images-only",
            action="store_true",
            help="Don't delete boulder DB rows that have no problems, only "
            " image files that have no boulders",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        if dry_run:
            print("Dry run, nothing will be modified")

        # Prune boulders first, so we know for sure we're not leaving images
        if not options["images_only"]:
            self.prune_boulders(dry_run)

        self.prune_images(dry_run)

    def prune_boulders(self, dry_run):
        # We may want to remove this logic at some point, if the UI ever starts
        # presenting the DB schema as it is (rather than pretending that
        # boulders and problems are 1:1). That seems unlikely though.
        dangling_boulders = Boulder.objects.exclude(
            id__in=Problem.objects.values("boulder_id")
        )

        if dry_run:
            num_deleted = len(dangling_boulders)
        else:
            (num_deleted, _) = dangling_boulders.delete()
        print(f"Deleted {num_deleted} boulders")

    def prune_images(self, dry_run):
        # Get a set of all the images that *are* referenced
        live_images = set(Boulder.objects.all().values_list("image", flat=True))

        # Figure out which subdir in the media folder boulders get uploaded to,
        # by pulling it from the model definition
        boulder_dir = Boulder.image.field.upload_to

        # Scan the storage for all images, then we'll prune out the orphans
        # Storage API: https://docs.djangoproject.com/en/4.0/ref/files/storage/
        all_images = set(
            os.path.join(boulder_dir, file_name)
            for file_name in
            # Returns a tuple of (dirs, files), we just want files
            default_storage.listdir(
                os.path.join(default_storage.location, boulder_dir)
            )[1]
        )

        orphaned_images = all_images - live_images
        print(f"{len(orphaned_images)} images to be deleted")
        for image in orphaned_images:
            print(f"  Deleting {image}")
            if not dry_run:
                default_storage.delete(image)
