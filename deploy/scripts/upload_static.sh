#!/bin/sh

# Static build+release is typically done by CI, but the upload job is known to
# be flaky, so this script is a backup.
# You have to download the assets yourself from a CI run, then pass the paths
# to this script to unzip and upload them.

set -e

UI_PATH=${1}
API_PATH=${2}
BUCKET_NAME=beta-spray-static
GIT_HASH=$(git rev-parse origin/master)

# ARTIFACT_DATA=$(curl -s https://api.github.com/repos/LucasPickering/beta-spray/actions/artifacts)
# UI_URL=$(echo $ARTIFACT_DATA | jq -r '[.artifacts | .[] | select(.name == "ui-static-assets")] | first | .archive_download_url')
# API_URL=$(echo $ARTIFACT_DATA | jq -r '[.artifacts | .[] | select(.name == "api-static-assets")] | first | .archive_download_url')
TEMP_DIR=./temp

unzip $UI_PATH -d $TEMP_DIR
unzip $API_PATH -d $TEMP_DIR/api-static

pushd $TEMP_DIR
gsutil -m cp -r ./ gs://$BUCKET_NAME/$GIT_HASH
popd

rm -rf $TEMP_DIR
