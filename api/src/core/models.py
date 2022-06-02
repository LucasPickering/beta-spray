from django.db.models import F, Q, Max
from django.db.models.functions import Coalesce
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
from django.db import models
from enum import Enum
from .queryset import BetaMoveQuerySet
from . import util


class SlideDirection(Enum):
    DOWN = "down"
    UP = "up"


class BodyPart(models.TextChoices):
    """A body part that someone could put on a hold"""

    # we could easily expand this later to include knees, spleen, etc.
    LEFT_HAND = "LH"
    RIGHT_HAND = "RH"
    LEFT_FOOT = "LF"
    RIGHT_FOOT = "RF"


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
    # Positions are *0-1*, not in pixels!! This allows for scaling on the image
    # without messing up these positions
    position_x = models.FloatField(
        help_text="Left-to-right position of the hold within the image, 0-1"
    )
    position_y = models.FloatField(
        help_text="Top-to-bottom position of the hold within the image, 0-1"
    )
    source = models.CharField(
        max_length=4,
        choices=HoldAnnotationSource.choices,
        help_text="Source of this boulder-hold attribution (auto or manual)",
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
    holds = models.ManyToManyField(
        Hold, related_name="problems", through="ProblemHold", blank=True
    )
    # Technically we could get this by going through holds, but having an extra
    # FK makes it a lot easier
    boulder = models.ForeignKey(
        Boulder, related_name="problems", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @staticmethod
    def slide_moves(beta_id, direction, from_order, to_order=None):
        """
        Slide the moves in a beta either up or down one slot, starting from a
        given order and optionally ending at another order. If `to_order` is
        not given, this will go to the end of the list.

        `from_order` and `to_order` are both inclusive.

        In this case, "down" means "increasing order". The metaphor is of a
        vertical list of increasing orders.
        """

        if direction == SlideDirection.DOWN:
            order_expr = F("order") + 1
        elif direction == SlideDirection.UP:
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
        help_text="Optional destination hold for this move",
    )
    order = models.PositiveIntegerField(
        db_index=True,  # We sort and filter by this a lot
        help_text="Ordering number of the hold in the beta, starting at 1",
    )
    body_part = models.CharField(
        max_length=2,
        choices=BodyPart.choices,
        help_text="Body part in question",
    )
    # TODO add annotation, e.g. "flag", "drop knee", etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# ========== SIGNALS ==========


@receiver(post_delete, sender=Boulder)
def boulder_on_post_delete(sender, instance, **kwargs):
    """
    After deleting a boulder, delete the associated image from media storage
    """
    # IMPORTANT: Without save=False, this will reincarnate the deleted row by
    # calling .save() on it with an empty image path
    instance.image.delete(save=False)


@receiver(post_delete, sender=Problem)
def problem_on_post_delete(sender, instance, **kwargs):
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
def beta_move_on_pre_save(sender, instance, raw, **kwargs):
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
        if instance.order is None:
            # No order given, just do max+1 (or default to 1)
            # TODO make sure this is atomic
            instance.order = (
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
                direction=SlideDirection.DOWN,
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
                direction=SlideDirection.UP,
                # If we're moving e.g. 4->7, slide 5-7 to be 4-6
                from_order=old_order + 1,
                to_order=new_order,
            )
        elif old_order > new_order:
            # Moving *up* the list, so slide intermediate moves *down*
            Beta.slide_moves(
                beta_id=beta_id,
                direction=SlideDirection.DOWN,
                # If we're moving e.g. 7->4, slide 4-6 to be 5-7
                from_order=new_order,
                to_order=old_order - 1,
            )
        else:
            # Order didn't change, do nothing
            pass


@receiver(post_delete, sender=BetaMove)
def beta_move_on_post_delete(sender, instance, **kwargs):
    """
    Upon deleting a move, slide all moves below it in the list up 1
    """
    Beta.slide_moves(
        beta_id=instance.beta_id,
        direction=SlideDirection.UP,
        from_order=instance.order,
    )
