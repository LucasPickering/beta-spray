from django.db import models
import uuid


class UUIDPrimaryKeyField(models.UUIDField):
    """
    A DB column that uses a UUID as the primary key. Should be used for all
    models.

    TODO https://code.djangoproject.com/ticket/32577
    Set this as DEFAULT_AUTO_FIELD when possible
    """

    def __init__(self, *args, **kwargs):
        kwargs["primary_key"] = True
        # Note: We *can* use RandomUUID here to generate the UUID on the pg
        # side, but then Django doesn't load the value back after creation, so
        # we need to generate the UUID in Python instead
        kwargs["default"] = uuid.uuid4
        kwargs["editable"] = False
        super().__init__(*args, **kwargs)


class BoulderImage(models.Model):
    """
    A user-uploaded image of a rock wall, which should contain holds that make
    up one or more problem
    """

    # TODO use an abstract base class to define this field in all models
    id = UUIDPrimaryKeyField()
    path = models.TextField(unique=True)


class Hold(models.Model):
    """
    A single hold on a rock wall, which can belong to any number of problems
    """

    id = UUIDPrimaryKeyField()
    image = models.ForeignKey(
        BoulderImage, related_name="holds", on_delete=models.CASCADE
    )
    # Positions are *0-1*, not in pixels!! This allows for scaling on the image
    # without messing up these positions
    position_x = models.FloatField(
        help_text="Left-to-right position of the hold within the image, 0-1"
    )
    position_y = models.FloatField(
        help_text="Top-to-bottom position of the hold within the image, 0-1"
    )


class Problem(models.Model):
    """
    A problem is made up of a collection of holds
    """

    id = UUIDPrimaryKeyField()
    holds = models.ManyToManyField(Hold, related_name="problems", blank=True)
    # Technically we could get this by going through holds, but having an extra
    # FK makes it a lot easier
    image = models.ForeignKey(
        BoulderImage, related_name="problems", on_delete=models.CASCADE
    )


class BodyPart(models.TextChoices):
    """A body part that someone could put on a hold"""

    # we could easily expand this later to include knees, spleen, etc.
    LEFT_HAND = "LH"
    RIGHT_HAND = "RH"
    LEFT_FOOT = "LF"
    RIGHT_FOOT = "RF"


class Beta(models.Model):
    """
    A prescribed series of moves to solve a problem.
    """

    id = UUIDPrimaryKeyField()
    problem = models.ForeignKey(
        Problem, related_name="betas", on_delete=models.CASCADE
    )


class BetaMove(models.Model):
    """
    Beta a single action in a beta. Most moves have a hold associated, but not
    necessarily (e.g. smear, flag, etc.).
    """

    class Meta:
        unique_together = ("beta", "order")

    id = UUIDPrimaryKeyField()
    beta = models.ForeignKey(
        "Beta", related_name="moves", on_delete=models.CASCADE
    )
    hold = models.ForeignKey(
        Hold,
        on_delete=models.CASCADE,
        null=True,
        help_text="Optional destination hold for this move",
    )
    order = models.PositiveIntegerField(
        help_text="Ordering number of the hold in the beta, with 0 as start"
    )
    body_part = models.CharField(
        max_length=2,
        choices=BodyPart.choices,
        help_text="Body part in question",
    )
    # TODO add annotation, e.g. "flag", "drop knee", etc.
