import socket
from .settings import *  # noqa: F401,F403

ALLOWED_HOSTS = ["*"]
DEBUG = True
SECRET_KEY = (
    "django-insecure-w+z=*+&h$9($a%z^ma)y-)07t^$!73iw^u)aajn($ts378b#zz"
)

# Configure INTERNAL_IPS correctly for docker
hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
INTERNAL_IPS = [ip[: ip.rfind(".")] + ".1" for ip in ips] + [
    "127.0.0.1",
    "10.0.2.2",
]

# In dev, we store static files and media on the local FS. In prod, both live
# in GCS buckets and are served directly by nginx, so we don't need any of these
# rules.
STATIC_ROOT = BASE_DIR / "static"  # noqa F405
STATIC_URL = "/api/static/"

MEDIA_ROOT = BASE_DIR / "media"  # noqa F405
MEDIA_URL = "/api/media/"

# Add debug middlewares
MIDDLEWARE.append(  # noqa F405
    "graphiql_debug_toolbar.middleware.DebugToolbarMiddleware"
)
GRAPHENE["MIDDLEWARE"].append(  # noqa F405
    "graphene_django.debug.DjangoDebugMiddleware"
)
