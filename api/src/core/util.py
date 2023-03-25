from __future__ import annotations

import random
import uuid
from typing import TYPE_CHECKING, Optional

from django.core.files.uploadedfile import UploadedFile
from django.db.models.fields.files import ImageFieldFile

if TYPE_CHECKING:
    from .schema.query import Image

problem_name_phrase_groups: list[list[Optional[str]]] = [
    ["Up Up", "Monster", "Slab", "Crack", "Lateral"],
    ["Up", "And Away", "Sauce", "Joy", "Wolves", "Psoriasis"],
    # repetition => weighted odds
    [None, None, None, "2.0", "But Harder"],
]

beta_name_phrase_groups: list[list[Optional[str]]] = [
    ["Simply", "Just", "You", "All you have to do is"],
    [
        "Hang On",
        "Don't Let Go",
        "Don't Fall",
        "Send It",
        "Squeeze Harder",
        "Be Taller",
        "Don't Be Short?",
        "Grow 6 Inches",
    ],
]


def random_phrase(phrase_groups: list[list[Optional[str]]]) -> str:
    """
    Generate a phrase by picking one element from each phrase group and joining
    them together.

    Arguments
    ---------
    phrase_groups - A list of phrase groups. Each group is a collection of
        elements that *could* go in that phrase position. One element is
        selected from each group, in the given order. To make a group optional,
        include a `None` element (or multiple, for weighted odds).
    """

    return " ".join(
        filter(None, (random.choice(group) for group in phrase_groups))
    )


def random_problem_name() -> str:
    return random_phrase(problem_name_phrase_groups)


def random_beta_name() -> str:
    return random_phrase(beta_name_phrase_groups)


def clean_input_file(file: UploadedFile) -> UploadedFile:
    """
    Clean an uploaded file. This will generate a random file name for the file,
    with an extension based on its declared content type. Used by the
    ImageUpload type.
    """
    # TODO validate file is an image and max size
    extension = file.content_type.split("/")[-1]
    # Replace file name with a UUID
    file.name = f"{uuid.uuid4()}.{extension}"
    return file


def get_svg_dimensions(
    image: ImageFieldFile | Image,
) -> tuple[float, float]:
    """
    Get the dimensions of this image in the SVG system. The smaller of the
    two dimensions will always be 100, and the larger will be multiplied
    or divided by the aspect ratio (whichever would make it >100). This
    ensures that distance in X is equal to distance in Y.

    Thanks to duck typing, this function works on `ImageFieldFile` or the
    GraphQL `Image` type.
    """
    aspect_ratio = image.width / image.height
    return (
        (100, 100 / aspect_ratio)
        if aspect_ratio < 1
        else (100 * aspect_ratio, 100)
    )
