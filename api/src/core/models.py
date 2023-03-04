from typing import Any, Literal, Optional

from django.contrib.auth.models import User
from django.db import models
from django.db.models import (
    ExpressionWrapper,
    F,
    Max,
    Min,
    OuterRef,
    Q,
    Subquery,
)
from django.db.models.functions import Coalesce
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver
from strawberry_django_plus import gql

from core import fields

from . import util
from .queryset import BetaMoveQuerySet


# Typing on this seems to be wonky because gql.enum is made for stock enums,
# not Django choice enums
@gql.enum
class BodyPart(models.TextChoices):  # type: ignore
    """A body part that someone could put on a hold"""

    # we could easily expand this later to include knees, spleen, etc.
    LEFT_HAND = "LH"
    RIGHT_HAND = "RH"
    LEFT_FOOT = "LF"
    RIGHT_FOOT = "RF"


@gql.enum
class Visibility(models.TextChoices):  # type: ignore
    """Visibility of an object within the platform, i.e. who else can see it?"""

    PRIVATE = "private"
    UNLISTED = "unlisted"
    PUBLIC = "public"


class HoldAnnotationSource(models.TextChoices):
    """
    The source of a hold annotation on an boulder, or of a hold within a problem
    """

    USER = "user"  # User added attribution manually
    AUTO = "auto"  # ML model added attribution


class Boulder(models.Model):
    """
    A user-uploaded image of a rock wall, which should contain holds that make
    up one or more problem
    """

    name = models.TextField()  # This field isn't populated yet
    image = models.ImageField(unique=True, upload_to="boulders")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # TODO override __str__ after name field is actually populated


class Hold(models.Model):
    """
    A single hold on a rock wall, which can belong to any number of problems
    """

    boulder = models.ForeignKey(
        Boulder, related_name="holds", on_delete=models.CASCADE
    )
    position = fields.BoulderPositionField(
        help_text="Position of the hold within the boulder image"
    )
    source = models.CharField(
        max_length=4,
        choices=HoldAnnotationSource.choices,
        help_text="Source of this boulder-hold attribution (auto or manual)",
    )
    annotation = models.TextField(
        blank=True, help_text="Free-form annotations created by the user"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Problem(models.Model):
    """
    A problem is made up of a collection of holds
    """

    class Meta:
        ordering = ["-created_at"]

    name = models.TextField(default=util.random_problem_name)
    external_link = models.URLField(
        blank=True, help_text="External link, e.g. to Mountain Project"
    )
    owner = models.ForeignKey(User, on_delete=models.PROTECT)
    visibility = models.TextField(
        choices=Visibility.choices,
        default=Visibility.PUBLIC,
        help_text="Access level for other users to this problem",
    )
    boulder = models.ForeignKey(
        Boulder, related_name="problems", on_delete=models.CASCADE
    )
    holds = models.ManyToManyField(
        Hold, related_name="problems", through="ProblemHold", blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class ProblemHold(models.Model):
    """
    m2m through table for problem-hold
    """

    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    hold = models.ForeignKey(Hold, on_delete=models.CASCADE)
    source = models.CharField(
        max_length=4,
        choices=HoldAnnotationSource.choices,
        help_text="Source of this problem-hold attribution (auto or manual)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Beta(models.Model):
    """
    A prescribed series of moves to solve a problem.
    """

    name = models.TextField(default=util.random_beta_name)
    problem = models.ForeignKey(
        Problem, related_name="betas", on_delete=models.CASCADE
    )
    owner = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name

    @staticmethod
    def slide_moves(
        beta_id: str,
        direction: Literal["up", "down"],
        from_order: int,
        to_order: Optional[int] = None,
    ) -> None:
        """
        Slide the moves in a beta either up or down one slot, starting from a
        given order and optionally ending at another order. If `to_order` is
        not given, this will go to the end of the list.

        `from_order` and `to_order` are both inclusive.

        In this case, "down" means "increasing order". The metaphor is of a
        vertical list of increasing orders.
        """

        if direction == "down":
            order_expr = F("order") + 1
        elif direction == "up":
            order_expr = F("order") - 1
        else:
            raise ValueError(f"Unexpected slide direction: {direction}")

        # Find our window basic on from/to values
        filt = Q(beta_id=beta_id, order__gte=from_order)
        if to_order is not None:
            filt &= Q(order__lte=to_order)

        BetaMove.objects.filter(filt).update(order=order_expr)


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
            # TODO enforce that orders are always consecutive
        ]
        ordering = ["order"]

    # Custom query set
    objects = BetaMoveQuerySet.as_manager()

    beta = models.ForeignKey(
        "Beta", related_name="moves", on_delete=models.CASCADE
    )
    hold = models.ForeignKey(
        Hold,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Destination hold for this move."
        " Mutually exclusive with `position`.",
    )
    position = fields.BoulderPositionField(
        null=True,
        blank=True,
        help_text="Position of the move, if not attached to a hold."
        " Mutually exclusive with `hold`.",
    )
    order = fields.MoveOrderField(
        blank=True,  # If omitted, will be auto-populated by a signal handler
        db_index=True,  # We sort by this a lot
        help_text="Ordering number of the hold in the beta, starting at 1",
    )
    is_start = models.BooleanField(
        # Technically this can be annotated on, but because it's interdependent
        # with other moves in the beta, it adds complexity at query time. It's
        # easier to store in the DB. At some point we should be able to make
        # this a generated column in postgres
        # TODO replace with generated column
        # https://code.djangoproject.com/ticket/31300
        # https://github.com/django/django/pull/16417
        editable=False,
        blank=True,  # Auto-populated, so don't require in forms
        help_text="Is this move part of the beta's starting body position? "
        "Calculated automatically whenever a beta is modified.",
    )
    body_part = models.CharField(
        max_length=2,
        choices=BodyPart.choices,
        help_text="Body part in question",
    )
    annotation = models.TextField(
        blank=True, help_text="Free-form annotations created by the user"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def get_is_start_expression(cls) -> ExpressionWrapper:
        """
        Get a query expression used to calculate is_start. This can be passed
        as the is_start keyword to an update query to re-calculate is_start for
        all moves in the queryset.
        """
        # Make sure we scope all operations to the move's beta
        filt = cls.objects.filter(beta_id=OuterRef("beta_id"))
        # This query is pretty complicated, but it's the best I can come up with
        # The strategy is:
        # - Figure our the first *non*-start move in the beta
        # - Check if the move is before/after that move
        return ExpressionWrapper(
            Q(
                order__lt=Subquery(
                    # Get the first non-start move by finding the lowest
                    # order that isn't the first of its body part
                    filt.exclude(
                        # Find the first move for each body part
                        order__in=filt.values("body_part")
                        .annotate(min_order=Min("order"))
                        .values("min_order")
                    )
                    # Remove annoying django clauses that break shit
                    .remove_group_by_order_by()
                    # If no body part has more than 1 move, everything is
                    # a start move so make up a fake "non-start" order. By
                    # the pigeon hole principle, this magic number just
                    # needs to be more than the number of body parts
                    .annotate(
                        first_non_start=Coalesce(Min("order"), 9999)
                    ).values("first_non_start")
                ),
            ),
            output_field=models.BooleanField(),
        )


# ========== SIGNALS ==========


@receiver(post_delete, sender=Boulder)
def boulder_on_post_delete(
    sender: Any, instance: Boulder, **kwargs: dict
) -> None:
    """
    After deleting a boulder, delete the associated image from media storage
    """
    # IMPORTANT: Without save=False, this will reincarnate the deleted row by
    # calling .save() on it with an empty image path
    instance.image.delete(save=False)


@receiver(post_delete, sender=Problem)
def problem_on_post_delete(
    sender: Any, instance: Problem, **kwargs: dict
) -> None:
    """
    After deleting a problem, delete the associated boulder (if no other
    problems point to it). This seems weird considering the DB schema allows
    boulders to live without any referencing problems, but it's because the UI
    masks the existence of boulders and pretends they're 1:1 with problems. This
    means once a problem is deleted, the underlying boulder is no longer
    accessible.

    In the future however, we may transparently allow multiple problems to
    point to the same boulder (e.g. if you copy a problem), to prevent
    duplicating images. Because of this, we want to make sure the boulder is
    unreferenced before deleting it.
    """
    Boulder.objects.filter(id=instance.boulder_id).exclude(
        id__in=Problem.objects.values("boulder_id")
    ).delete()


@receiver(pre_save, sender=BetaMove)
def beta_move_on_pre_save(
    sender: Any, instance: BetaMove, raw: bool, **kwargs: dict
) -> None:
    """
    Before creating a move, slide all the moves below it down 1 to make
    room. If updating an existing move, we need to slide the moves between
    the old and new order.
    """
    # Don't do anything for loaded fixtures
    if raw:
        return

    beta_id = instance.beta_id
    if instance.id is None:
        # Creating a new move
        # is_start will be fixed by the post-save hook
        instance.is_start = False
        if instance.order is None:
            # No order given, just do max+1 (or default to 1)
            # TODO make sure this is atomic
            instance.order = Subquery(
                BetaMove.objects.filter(beta_id=beta_id)
                # Remove annoying django clauses that break shit
                .remove_group_by_order_by()
                .annotate(next_order=Coalesce(Max("order") + 1, 1))
                .values("next_order")
            )
        else:
            # Order was given, slide everything below that value down to
            # make room
            Beta.slide_moves(
                beta_id=beta_id,
                direction="down",
                from_order=instance.order,
            )
    else:
        # Updating existing move: slide the moves between old and new spots
        old_order = BetaMove.objects.get(id=instance.id).order
        new_order = instance.order

        if old_order < new_order:
            # Moving *down* the list, so slide intermediate moves *up*
            Beta.slide_moves(
                beta_id=beta_id,
                direction="up",
                # If we're moving e.g. 4->7, slide 5-7 to be 4-6
                from_order=old_order + 1,
                to_order=new_order,
            )
        elif old_order > new_order:
            # Moving *up* the list, so slide intermediate moves *down*
            Beta.slide_moves(
                beta_id=beta_id,
                direction="down",
                # If we're moving e.g. 7->4, slide 4-6 to be 5-7
                from_order=new_order,
                to_order=old_order - 1,
            )
        else:
            # Order didn't change, do nothing
            pass


@receiver(post_save, sender=BetaMove)
def beta_move_on_post_save(
    sender: Any, instance: BetaMove, raw: bool, **kwargs: dict
) -> None:
    """
    After creating/updating a move, re-calculate is_start for the whole beta.
    This kinda sucks because doubles the number of updates, but it should go
    away once we can use generated columns.
    """
    # Don't do anything for loaded fixtures
    if raw:
        return

    BetaMove.objects.filter(beta_id=instance.beta_id).update(
        is_start=BetaMove.get_is_start_expression(),
    )


@receiver(post_delete, sender=BetaMove)
def beta_move_on_post_delete(
    sender: Any, instance: BetaMove, **kwargs: dict
) -> None:
    """
    Upon deleting a move, slide all moves below it in the list up 1
    """
    Beta.slide_moves(
        beta_id=instance.beta_id,
        direction="up",
        from_order=instance.order,
    )
