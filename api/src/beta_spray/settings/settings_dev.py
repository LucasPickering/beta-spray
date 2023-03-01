import ipaddress
import socket
from .settings import *  # noqa: F401,F403

ALLOWED_HOSTS = ["*"]
DEBUG = True
SECRET_KEY = (
    "django-insecure-w+z=*+&h$9($a%z^ma)y-)07t^$!73iw^u)aajn($ts378b#zz"
)

# Configure INTERNAL_IPS correctly for docker
ip = socket.gethostbyname(socket.gethostname())
# Include the full docker subnet in INTERNAL_IPS, so requests proxied from the
# UI container are considered internal
subnet = ip[: ip.rfind(".")] + ".0/24"
INTERNAL_IPS = ["127.0.0.1", *(str(ip) for ip in ipaddress.ip_network(subnet))]

# In dev, we store static files and media on the local FS. In prod, both live
# in GCS buckets and are served directly by nginx, so we don't need any of these
# rules.
STATIC_ROOT = BASE_DIR / "static"  # noqa F405
STATIC_URL = "/api/static/"

MEDIA_ROOT = BASE_DIR / "media"  # noqa F405
MEDIA_URL = "/api/media/"

# Add debug middlewares
INSTALLED_APPS.append("debug_toolbar")  # noqa F405
MIDDLEWARE.append(  # noqa F405
    # Note: you have to go to localhost:8000 (not 3000) to make this work
    # TODO can we fix this with a fix to INTERNAL_IPS?
    "graphiql_debug_toolbar.middleware.DebugToolbarMiddleware"
)
GRAPHENE["MIDDLEWARE"].append(  # noqa F405
    "graphene_django.debug.DjangoDebugMiddleware"
)
