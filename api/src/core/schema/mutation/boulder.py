from core.models import Boulder
from core.schema.query import BoulderNode
from core import util
from graphene import relay
import graphene


class CreateBoulderMutation(relay.ClientIDMutation):
    class Input:
        image_file = graphene.String(required=True)

    boulder = graphene.Field(BoulderNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, image_file):
        # TODO handle file missing
        # TODO validate file is an image
        file = util.get_file(info, image_file)
        boulder = Boulder.objects.create(image=file)

        return cls(boulder=boulder)
