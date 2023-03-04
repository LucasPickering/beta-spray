"""beta_spray URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from strawberry.django.views import GraphQLView

from core.schema import schema

api_routes = [
    path("admin", admin.site.urls),
    path("graphql", GraphQLView.as_view(schema=schema)),
]

if settings.DEBUG:
    api_routes.append(path("__debug__/", include("debug_toolbar.urls")))

urlpatterns = [
    path("api/", include(api_routes)),
]


# Only include media route in dev
if settings.MEDIA_ROOT:
    urlpatterns.extend(
        static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    )
