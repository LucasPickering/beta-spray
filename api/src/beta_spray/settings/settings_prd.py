import os
from .settings import *  # noqa: F401,F403

BETA_SPRAY_HOSTNAME = os.environ["BETA_SPRAY_HOSTNAME"]
ALLOWED_HOSTS = [BETA_SPRAY_HOSTNAME]
DEBUG = False
SECRET_KEY = os.environ["BETA_SPRAY_SECRET_KEY"]
# Static assets are stored in the static image rather than the API image in prd
STATIC_URL = "/django/"
