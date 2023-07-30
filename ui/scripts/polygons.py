#!/usr/bin/env python3

"""
A script for generating SVG polygons, because I just want to make simple shapes
and every SVG editor sucks.
"""

import argparse
import math

SIN_30 = math.sin(math.radians(30))
COS_30 = math.cos(math.radians(30))
TAN_30 = math.tan(math.radians(30))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("shape", choices=SHAPES.keys())
    parser.add_argument("--length", "-l", type=float, default=6.5)
    parser.add_argument("--width", "-w", type=float, default=3.0)
    parser.add_argument("--radius", "-r", type=float, default=1.0)
    args = vars(parser.parse_args())

    shape = args.pop("shape")
    func = SHAPES[shape]
    path = func(**args)
    print(f'd="{format_path(path)}"')


def triangle(length, width, radius):
    half_length = length / 2.0
    d = half_length / COS_30
    h = d / 2.0
    s = radius / TAN_30

    # Points are clockwise from the top-left
    return [
        # Start at left side of top arc
        ("M", [-s * SIN_30, -d + s * COS_30]),
        # Top Arc (left-to-right)
        ("A", [radius, radius, 0, 0, 1, s * SIN_30, -d + s * COS_30]),
        # Right side
        ("L", [half_length - s * SIN_30, h - s * COS_30]),
        # Bottom-right arc (top-to-bottom)
        ("A", [radius, radius, 0, 0, 1, half_length - s, h]),
        # Bottom side
        ("L", [-half_length + s, h]),
        # Bottom-left arc (bottom-to-top)
        (
            "A",
            [
                radius,
                radius,
                0,
                0,
                1,
                -half_length + s * SIN_30,
                h - s * COS_30,
            ],
        ),
        # Left side
        ("Z", []),
    ]


def oval(length, width, radius):
    half_width = width / 2
    corner_y = length / 2 - radius

    # Points are clockwise from the top-left
    return [
        # Start at top-left
        ("M", [-half_width, -corner_y]),
        # Top arc
        ("A", [radius, radius, 0, 0, 1, half_width, -corner_y]),
        # Right side
        ("L", [half_width, corner_y]),
        # Bottom arc
        ("A", [radius, radius, 0, 0, 1, -half_width, corner_y]),
        # Left side
        ("Z", []),
    ]


def rectangle(length, width, radius):
    x_right = width / 2
    x_left = -x_right
    x_right_inner = x_right - radius
    x_left_inner = -x_right_inner
    y_bottom = length / 2
    y_top = -y_bottom
    y_bottom_inner = y_bottom - radius
    y_top_inner = -y_bottom_inner

    # Points are clockwise from the top-left
    return [
        ("M", [x_left, y_top_inner]),  # Start at bottom of top-left arc
        ("A", [radius, radius, 0, 0, 1, x_left_inner, y_top]),  # Top-left
        ("L", [x_right_inner, y_top]),  # Top
        ("A", [radius, radius, 0, 0, 1, x_right, y_top_inner]),  # Top-right
        ("L", [x_right, y_bottom_inner]),  # Right side
        ("A", [radius, radius, 0, 0, 1, x_right_inner, y_bottom]),  # Bot-right
        ("L", [x_left_inner, y_bottom]),  # Bottom
        ("A", [radius, radius, 0, 0, 1, x_left, y_bottom_inner]),  # Bot-left
        ("Z", []),  # Left
    ]


def staple(length, width, radius):
    x_right = width / 2
    x_left = -x_right
    x_right_inner = x_right - radius
    x_left_inner = -x_right_inner
    y_bottom = length / 2
    y_top = -y_bottom
    y_top_inner = y_top + math.copysign(radius, length)  # Allow inversion
    sweep = int(length >= 0)

    return [
        ("M", [x_left, y_bottom]),  # Start at bottom-left
        ("L", [x_left, y_top_inner]),  # Left
        ("A", [radius, radius, 0, 0, sweep, x_left_inner, y_top]),  # Top-left
        ("L", [x_right_inner, y_top]),  # Top
        ("A", [radius, radius, 0, 0, sweep, x_right, y_top_inner]),  # Top-right
        ("L", [x_right, y_bottom]),  # Right side
    ]


def gumdrop(width, length, radius):
    x_right = width / 2
    x_left = -x_right
    y_bottom = length / 2

    return [
        ("M", [x_left, y_bottom]),
        ("A", [radius, radius, 0, 0, 1, x_right, y_bottom]),
        ("Z", []),
    ]


def format_path(path):
    half_done = (
        (instr, ",".join(f"{param:.3g}" for param in params))
        for instr, params in path
    )
    return " ".join(f"{instr}{params}" for instr, params in half_done)


SHAPES = {
    "triangle": triangle,
    "oval": oval,
    "rectangle": rectangle,
    "staple": staple,
    "gumdrop": gumdrop,
}


if __name__ == "__main__":
    main()
