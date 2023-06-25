import factory
from django.contrib.auth.models import User
from factory.django import DjangoModelFactory
from factory.faker import Faker
from pytest_factoryboy import register

from bs_auth.models import UserProfile
from core.models import Boulder, Problem, Visibility


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    username = Faker("name")
    profile = factory.RelatedFactory(
        "core.tests.factories.UserProfileFactory", factory_related_name="user"
    )


class UserProfileFactory(DjangoModelFactory):
    class Meta:
        model = UserProfile

    user = factory.SubFactory(UserFactory)
    is_guest = False


class BoulderFactory(DjangoModelFactory):
    class Meta:
        model = Boulder

    image = factory.django.ImageField()


class ProblemFactory(DjangoModelFactory):
    class Meta:
        model = Problem

    boulder = factory.SubFactory(BoulderFactory)
    owner = factory.SubFactory(UserFactory)
    name = Faker("name")
    visibility = Visibility.PUBLIC


# We have to register at the bottom, to avoid circular import issues
register(UserFactory)
register(UserProfileFactory)
register(BoulderFactory)
register(ProblemFactory)
