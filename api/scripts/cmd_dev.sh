#!/bin/sh

set -ex

# When using this script, make sure you start the container with --init
# so that it dies properly

# This fails in the docker container without --no-ansi
# https://github.com/python-poetry/poetry/issues/7184
poetry install --no-ansi

./m.sh runserver 0.0.0.0:8000
