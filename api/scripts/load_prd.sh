#!/bin/sh

# Copy the production database to the local machine, including all boulder images
# *Warning!* This will obliterate everything local

set -e

API_DIR="$(git rev-parse --show-toplevel)/api"
DUMP_FILE=dump.json
FIXTURE_PATH="$API_DIR/src/$DUMP_FILE"
BOULDER_DIR="$API_DIR/src/media/boulders"
API_POD=$(kubectl get pod -o json | jq -r '.items[].metadata | select(.labels.app == "api") | .name')

cd $API_DIR

echo "Copying from pod $API_POD"
kubectl exec $API_POD -- bash -c "./m.sh dumpdata core > $DUMP_FILE"
kubectl cp "$API_POD:$DUMP_FILE" "$FIXTURE_PATH"
kubectl exec $API_POD -- rm "$DUMP_FILE"

echo "Loading data locally"
./m.sh flush --no-input
# This path is relative to manage.py (since it runs in the container)
./m.sh loaddata "$DUMP_FILE"
rm "$FIXTURE_PATH"

echo "Copying boulder images"
rm $BOULDER_DIR/*

# Grab a the list of image URLs from the DB
BOULDER_IMAGES=$(kubectl exec $API_POD -- ./m.sh shell --command="import json; from core.models import Boulder; print(json.dumps(list(boulder.image.url for boulder in Boulder.objects.all())))" | jq -r '.[]')
# Download files in parallel
echo $BOULDER_IMAGES | xargs -n1 -P10 wget --no-verbose -P $BOULDER_DIR
