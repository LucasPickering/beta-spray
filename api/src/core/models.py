from core.query import BetaMoveQuerySet
from django.db import models


class BoulderImage(models.Model):
    """
    A user-uploaded image of a rock wall, which should contain holds that make
    up one or more problem
    """

    image = models.ImageField(unique=True, upload_to="boulders")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Hold(models.Model):
    """
    A single hold on a rock wall, which can belong to any number of problems
    """

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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Problem(models.Model):
    """
    A problem is made up of a collection of holds
    """

    holds = models.ManyToManyField(Hold, related_name="problems", blank=True)
    # Technically we could get this by going through holds, but having an extra
    # FK makes it a lot easier
    image = models.ForeignKey(
        BoulderImage, related_name="problems", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


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

    problem = models.ForeignKey(
        Problem, related_name="betas", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class BetaMove(models.Model):
    """
    Beta a single action in a beta. Most moves have a hold associated, but not
    necessarily (e.g. smear, flag, etc.).
    """

    class Meta:
        constraints = [
            # constraint needs to be deferred to avoid unique violations within
            # "waterfall" updates
            # https://dba.stackexchange.com/questions/104987/avoid-unique-violation-in-atomic-transaction
            models.UniqueConstraint(
                name="beta_order_unique",
                fields=("beta", "order"),
                deferrable=models.Deferrable.DEFERRED,
            )
        ]

    # Custom query set
    objects = BetaMoveQuerySet.as_manager()

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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # TODO add annotation, e.g. "flag", "drop knee", etc.
