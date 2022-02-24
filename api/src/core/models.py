from django.db import models

class UUIDPrimaryKeyField(models.UUIDField):
    """
    A DB column that uses a UUID as the primary key. Should be used for all
    models.
    """

    # primary_key = True

    def __init__(self, *args, **kwargs):
        print(kwargs)
        super().__init__(*args, primary_key=True, **kwargs)


# Create your models here.
class Image(models.Model):
    """
    A user-uploaded image of a rock wall, which should contain holds that make
    up one or more problem
    """

    id = models.UUIDField(primary_key=True)
    path = models.TextField()

class Hold(models.Model):
    """
    A single hold on a rock wall, which can belong to any number of problems
    """

    id = models.UUIDField(primary_key=True)
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    # Positions are *0-1*, not in pixels!! This allows for scaling on the image
    # without messing up these positions
    position_x = models.FloatField(help_text="Left-to-right position of the hold within the image, 0-1")
    position_y = models.FloatField(help_text="Top-to-bottom position of the hold within the image, 0-1")

class Problem(models.Model):
    """
    A problem is made up of a collection of holds
    """

    id = models.UUIDField(primary_key=True)
    holds = models.ManyToManyField(Hold)

class BodyPart(models.TextChoices):
    """
    All the body parts that someone could put on a hold.

    (we could easily expand this later to include knees, spleen, etc.)
    """

    LEFT_HAND = 'LH'
    RIGHT_HAND = 'RH'
    LEFT_FOOT = 'LF'
    RIGHT_FOOT = 'RF'

class BetaHold(models.Model):
    """
    Beta-Hold m2m middleman. There can be multiple iterations of a beta-hold
    pair, for repeated usage of a hold (often, but not always, with different
    body parts).
    """

    id = models.UUIDField(primary_key=True)
    beta = models.ForeignKey('Beta', on_delete=models.CASCADE)
    hold = models.ForeignKey(Hold, on_delete=models.CASCADE)
    body_part = models.CharField(max_length=2, choices=BodyPart.choices, help_text="Body part to put on this hold")
    # could potentially add room for annotations here, e.g. "drop knee", "heel hook", etc.


class Beta(models.Model):
    """
    A prescribed series of moves to solve a problem.
    """

    id = models.UUIDField(primary_key=True)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    holds = models.ManyToManyField(Hold, through=BetaHold)
