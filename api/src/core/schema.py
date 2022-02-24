import graphene
from graphene_django import DjangoObjectType

from core.models import BoulderImage, Hold


class BoulderImageType(DjangoObjectType):
    class Meta:
        model = BoulderImage
        fields = ("id", "path", "holds")


class HoldType(DjangoObjectType):
    class Meta:
        model = Hold
        fields = ("id", "image", "position_x", "position_y")


class Query(graphene.ObjectType):
    images = graphene.List(BoulderImageType)

    def resolve_images(root, info):
        return BoulderImage.objects.all()


schema = graphene.Schema(query=Query)
