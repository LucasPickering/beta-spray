import os

from .settings import *  # noqa: F401,F403

BETA_SPRAY_HOSTNAME = os.getenv("BETA_SPRAY_HOSTNAME")
ALLOWED_HOSTS = ["localhost", "api", BETA_SPRAY_HOSTNAME]

# WARNING: This is only save if nginx is configured to strip the
# X-Forwarded-Proto and replace it with its own value. Needed to make CSRF work.
# https://docs.djangoproject.com/en/4.0/ref/settings/#secure-proxy-ssl-header
# https://stackoverflow.com/a/71482883/1907353
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

DEBUG = False
SECRET_KEY = os.getenv("BETA_SPRAY_SECRET_KEY")
# By not starting this URL with /api/, we avoid collisions between URL matches
# in nginx
STATIC_URL = "/api-static/"
