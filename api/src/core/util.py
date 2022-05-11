import random

problem_name_phrase_groups = [
    ["Up Up", "Monster", "Slab", "Crack", "Lateral"],
    ["Up", "And Away", "Sauce", "Joy", "Wolves", "Psoriasis"],
    # repetition => weighted odds
    [None, None, None, "2.0", "But Harder"],
]

beta_name_phrase_groups = [
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


def random_phrase(phrase_groups):
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
