#!/bin/sh

set -ex

gunicorn beta_spray.wsgi -b :8000
