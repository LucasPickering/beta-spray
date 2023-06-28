import ipaddress
import socket

from .settings import *  # noqa: F401,F403

ALLOWED_HOSTS = ["*"]
DEBUG = True
SECRET_KEY = (
    "django-insecure-w+z=*+&h$9($a%z^ma)y-)07t^$!73iw^u)aajn($ts378b#zz"
)

# Configure INTERNAL_IPS correctly for docker
INTERNAL_IPS = ["127.0.0.1"]
try:
    ip = socket.gethostbyname(socket.gethostname())
    # Include the full docker subnet in INTERNAL_IPS, so requests proxied from
    # the UI container are considered internal
    subnet = ip[: ip.rfind(".")] + ".0/24"
    INTERNAL_IPS += [str(ip) for ip in ipaddress.ip_network(subnet)]
except socket.gaierror:
    # This can fail when running locally
    pass

# In dev, we store static files and media on the local FS. In prod, both live
# in GCS buckets and are served directly by nginx, so we don't need any of these
# rules.
STATIC_ROOT = BASE_DIR / "static"  # noqa F405
STATIC_URL = "/api/static/"

MEDIA_ROOT = BASE_DIR / "media"  # noqa F405
MEDIA_URL = "/api/media/"
