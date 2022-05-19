#!/bin/sh

GIT_TAG=latest
REPO_ROOT=$(git rev-parse --show-toplevel)
VERSION_SHA=$(git rev-parse origin/master)

echo "Deploying version '$VERSION_SHA'"
terraform -chdir=$REPO_ROOT/deploy/terraform/deploy apply -var version_sha=$VERSION_SHA

# Update
git tag -f $GIT_TAG $VERSION_SHA
git push -f origin $GIT_TAG
echo "Updated git tag '$GIT_TAG' to '$VERSION_SHA'"
