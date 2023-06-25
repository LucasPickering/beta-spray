#!/bin/sh

set -ex

cd src

./manage.py migrate
gunicorn beta_spray.wsgi -b :8000
