import graphene
from graphene_django import DjangoObjectType

from core.models import BoulderImage, Hold, Problem


class BoulderImageType(DjangoObjectType):
    class Meta:
        model = BoulderImage
        fields = ("id", "path", "holds", "problems")


class HoldType(DjangoObjectType):
    class Meta:
        model = Hold
        fields = ("id", "image", "position_x", "position_y")


class ProblemType(DjangoObjectType):
    class Meta:
        model = Problem
        fields = ("id", "holds", "image")


class Query(graphene.ObjectType):
    images = graphene.List(BoulderImageType)

    def resolve_images(root, info):
        return BoulderImage.objects.all()


schema = graphene.Schema(query=Query)
