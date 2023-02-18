import os
from .settings import *  # noqa: F401,F403

BETA_SPRAY_HOSTNAME = os.getenv("BETA_SPRAY_HOSTNAME")
ALLOWED_HOSTS = ["localhost", "api", BETA_SPRAY_HOSTNAME]
DEBUG = False
SECRET_KEY = os.getenv("BETA_SPRAY_SECRET_KEY")
# By not starting this URL with /api/, we avoid collisions between URL matches
# in nginx
STATIC_URL = "/api-static/"

if not GS_BUCKET_NAME:  # noqa F405
    raise ValueError("Media GCS bucket `GS_BUCKET_NAME` not set.")
