#!/bin/sh

set -ex

poetry install

./m.sh graphql_schema --out schema.graphql
./m.sh runserver 0.0.0.0:8000
