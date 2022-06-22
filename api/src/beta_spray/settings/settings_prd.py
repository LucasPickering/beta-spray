import os
import urllib.parse
from .settings import *  # noqa: F401,F403

ALLOWED_HOSTS = [
    "localhost",
    "api",
    # Convert the full URL to just the hostname
    urllib.parse.urlparse(BETA_SPRAY_HOST).hostname,  # noqa F405
]
DEBUG = False
SECRET_KEY = os.environ["BETA_SPRAY_SECRET_KEY"]
# By not starting this URL with /api/, we avoid collisions between URL matches
# in nginx
STATIC_URL = "/api-static/"

if not GS_BUCKET_NAME:  # noqa F405
    raise ValueError("Media GCS bucket `GS_BUCKET_NAME` not set.")
