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
    parser.add_argument("shape", choices=["triangle", "oval"])
    parser.add_argument("--length", "-l", type=float, default=6.5)
    parser.add_argument("--width", "-w", type=float, default=3.0)
    parser.add_argument("--radius", "-r", type=float, default=1.0)
    args = parser.parse_args()

    if args.shape == "triangle":
        path = triangle(args.length, args.radius)
    elif args.shape == "oval":
        path = oval(args.length, args.width, args.radius)
    print(format_path(path))


def triangle(side_length, radius):
    half_length = side_length / 2.0
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


def format_path(path):
    half_done = (
        (instr, ",".join(f"{param:.3g}" for param in params))
        for instr, params in path
    )
    return " ".join(f"{instr}{params}" for instr, params in half_done)


if __name__ == "__main__":
    main()
