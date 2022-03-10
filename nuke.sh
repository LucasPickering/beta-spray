#!/bin/sh

set -ex

api/m.sh migrate core zero
rm api/src/core/migrations/0*.py
api/m.sh makemigrations
api/m.sh migrate
