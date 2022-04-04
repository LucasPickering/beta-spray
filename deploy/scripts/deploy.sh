#!/bin/sh

set -e

# Grab the latest *published* master
VERSION=$(git rev-parse origin/master)

if $(helm list | grep -q beta-spray); then
    SUBCOMMAND=upgrade
else
    SUBCOMMAND=install
fi

set -x
helm $SUBCOMMAND beta-spray helm/ --set version_sha=$VERSION
