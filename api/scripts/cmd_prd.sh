#!/bin/sh

set -ex

source $(poetry env info --path)/bin/activate
cd src

./manage.py migrate
gunicorn beta_spray.wsgi -b :8000
