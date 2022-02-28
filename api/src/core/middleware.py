import logging

logger = logging.getLogger(__name__)


class ErrorMiddleware(object):
    """
    Graphene middleware to properly forward errors
    """

    def on_error(self, error):
        # Apparently this is enough to make errors appear in the GQl output
        logger.error(error)
        raise error
