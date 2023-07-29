import factory
import factory.random
from django.contrib.auth.models import User
from factory import Factory
from factory.django import DjangoModelFactory
from factory.faker import Faker
from pytest_factoryboy import register

from bs_auth.models import UserProfile
from core.fields import BoulderPosition
from core.models import (
    Beta,
    BetaMove,
    Boulder,
    Hold,
    HoldAnnotationSource,
    Problem,
    Visibility,
)


def position_factory() -> str:
    x = factory.random.random.random()
    y = factory.random.random.random()
    return f"{x},{y}"


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True

    username = Faker("name")
    password = "!placeholder"
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


class BoulderPositionFactory(Factory):
    class Meta:
        model = BoulderPosition

    x = factory.LazyFunction(factory.random.random.random)
    y = factory.LazyFunction(factory.random.random.random)


class HoldFactory(DjangoModelFactory):
    class Meta:
        model = Hold

    problem = factory.SubFactory(ProblemFactory)
    position = factory.SubFactory(BoulderPositionFactory)
    source = HoldAnnotationSource.USER


class BetaFactory(DjangoModelFactory):
    class Meta:
        model = Beta
        skip_postgeneration_save = True

    problem = factory.SubFactory(ProblemFactory)
    owner = factory.SubFactory(UserFactory)
    name = Faker("name")
    moves = factory.RelatedFactoryList(
        "core.tests.factories.BetaMoveFactory",
        factory_related_name="beta",
        size=5,
    )


class BetaMoveFactory(DjangoModelFactory):
    class Meta:
        model = BetaMove

    class Params:
        is_free = Faker("pybool")

    beta = factory.SubFactory(BetaFactory, moves=[])
    order = factory.Sequence(lambda n: n)
    hold = factory.Maybe(
        "is_free",
        yes_declaration=None,
        no_declaration=factory.SubFactory(HoldFactory),
    )
    position = factory.Maybe(
        "is_free",
        yes_declaration=factory.SubFactory(BoulderPositionFactory),
        no_declaration=None,
    )


# We have to register at the bottom, to avoid circular import issues
register(UserFactory)
register(UserFactory, _name="other_user")
register(UserProfileFactory)
register(BoulderFactory)
register(ProblemFactory)
register(BoulderPositionFactory)
register(HoldFactory)
register(BetaFactory)
register(BetaMoveFactory)
