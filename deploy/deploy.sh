#!/bin/sh

REPO_ROOT=$(git rev-parse --show-toplevel)
VERSION_SHA=$(git rev-parse origin/master)

echo "Deploying version $VERSION_SHA"
terraform -chdir=$REPO_ROOT/deploy/terraform/deploy apply -var version_sha=$VERSION_SHA
