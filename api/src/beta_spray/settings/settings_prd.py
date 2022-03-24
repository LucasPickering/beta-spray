import os
from .settings import *  # noqa: F401,F403

BETA_SPRAY_HOSTNAME = os.environ["BETA_SPRAY_HOSTNAME"]
ALLOWED_HOSTS = [BETA_SPRAY_HOSTNAME]
DEBUG = False
SECRET_KEY = os.environ["BETA_SPRAY_SECRET_KEY"]
# By not starting this URL with /api/, we avoid collisions between URL matches
# in nginx
STATIC_URL = "/api-static/"
