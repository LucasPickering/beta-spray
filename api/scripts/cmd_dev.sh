#!/bin/sh

set -ex

# When using this script, make sure you start the container with --init
# so that it dies properly

poetry install

./m.sh graphql_schema --watch &
./m.sh runserver 0.0.0.0:8000
