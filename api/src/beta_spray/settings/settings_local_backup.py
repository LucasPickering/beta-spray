# Settings file used only for backing up/restoring the local DB to the local
# file system. Useful in DB transfers for development.

from .settings import *  # noqa: F401,F403

DBBACKUP_STORAGE = "django.core.files.storage.FileSystemStorage"
DBBACKUP_STORAGE_OPTIONS = {"location": "/backups/"}
DBBACKUP_CLEANUP_KEEP = 1
DBBACKUP_CLEANUP_KEEP_MEDIA = 1

# Make sure media files are restored to the correct place
MEDIA_ROOT = BASE_DIR / "media"  # noqa F405
