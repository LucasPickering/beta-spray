import logging

logger = logging.getLogger(__name__)


class ErrorMiddleware(object):
    """
    Graphene middleware to properly forward errors
    """

    def resolve(self, next, root, info, *args, **kwargs):
        try:
            return next(root, info, *args, **kwargs)
        except Exception as e:
            # TODO better formatting
            logger.error(f"Error handling GraphQL request:\n{info}", exc_info=e)
            raise e
