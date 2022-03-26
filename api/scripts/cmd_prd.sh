#!/bin/sh

set -ex

./m.sh migrate
./m.sh runserver 0.0.0.0:8000
