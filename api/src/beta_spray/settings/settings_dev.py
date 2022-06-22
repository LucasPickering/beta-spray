from .settings import *  # noqa: F401,F403

ALLOWED_HOSTS = ["*"]
DEBUG = True
SECRET_KEY = (
    "django-insecure-w+z=*+&h$9($a%z^ma)y-)07t^$!73iw^u)aajn($ts378b#zz"
)

# In dev, we store static files and media on the local FS. In prod, both live
# in GCS buckets and are served directly by nginx, so we don't need any of these
# rules.
STATIC_ROOT = BASE_DIR / "static"  # noqa F405
STATIC_URL = "/api/static/"

MEDIA_ROOT = BASE_DIR / "media"  # noqa F405
# We need to attach the host for local images, even though the path is
# accessible via proxy, otherwise next.js freaks the fuck out when trying to
# optimize images
MEDIA_URL = f"{BETA_SPRAY_HOST}/api/media/"  # noqa F405
