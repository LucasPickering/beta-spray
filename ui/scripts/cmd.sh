#!/bin/sh

set -ex

# When using this script, make sure you start the container with --init
# so that it dies properly

npm install

# Disabled on ARM until https://github.com/facebook/relay/issues/3799
# Run separately outside docker for now
if [ $(uname -m) == "x86_64" ]; then
    npm run relay:watch &
fi
npm run start
