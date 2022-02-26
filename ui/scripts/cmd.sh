#!/bin/sh

set -ex

# When using this script, make sure you start the container with --init
# so that it dies properly

npm install

# Disabled until https://github.com/facebook/relay/issues/3799
# Run separately outside docker for now
# npm run relay:watch &
npm run start
