#!/bin/sh

set -e

VERSION=$(git rev-parse HEAD)

if $(helm list | grep -q beta-spray); then
    SUBCOMMAND=upgrade
else
    SUBCOMMAND=install
fi

set -x
helm $SUBCOMMAND beta-spray helm/ --set version_sha=$VERSION
