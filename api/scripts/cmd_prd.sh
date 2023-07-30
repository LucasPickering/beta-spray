#!/bin/sh

set -ex

./m.sh migrate
gunicorn beta_spray.wsgi -b :8000
