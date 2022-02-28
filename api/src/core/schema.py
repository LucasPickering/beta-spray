from graphene import relay, ObjectType, Schema
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from core.models import BoulderImage, Hold, Problem


class BoulderImageNode(DjangoObjectType):
    class Meta:
        model = BoulderImage
        interfaces = (relay.Node,)
        fields = ("path", "holds", "problems")
        filter_fields = []


class HoldNode(DjangoObjectType):
    class Meta:
        model = Hold
        interfaces = (relay.Node,)
        fields = ("image", "position_x", "position_y")
        filter_fields = []


class ProblemNode(DjangoObjectType):
    class Meta:
        model = Problem
        interfaces = (relay.Node,)
        fields = ("holds", "image")
        filter_fields = []


class Query(ObjectType):
    images = DjangoFilterConnectionField(BoulderImageNode)
    image = relay.Node.Field(BoulderImageNode)
    problem = relay.Node.Field(ProblemNode)


schema = Schema(query=Query)
