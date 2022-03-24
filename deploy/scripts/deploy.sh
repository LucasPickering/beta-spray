#!/bin/sh

set -e

VERSION=$(git rev-parse HEAD)

helm upgrade beta-spray helm/ --set version_sha=$VERSION
