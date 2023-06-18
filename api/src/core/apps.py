import logging

from django.apps import AppConfig
from django.conf import settings
from strawberry.printer import print_schema

logger = logging.getLogger(__name__)


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self) -> None:
        if settings.DEBUG:
            # We have to defer this import so it doesn't happen before the app
            # is ready, otherwise django gets very upset
            from .schema import schema

            # Export GQL schema upon startup
            schema_string = print_schema(schema)
            with open(settings.GRAPHQL_SCHEMA_PATH, "w") as f:
                f.write(schema_string)
            logger.info(
                f"Exported GraphQL schema to {settings.GRAPHQL_SCHEMA_PATH}"
            )
