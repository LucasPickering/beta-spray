#!/bin/sh

#########################################
# Utility script for database operations
# Backup, restore, etc.
#########################################

set -e

PRD_BUCKET=beta-spray-backup
DEV_BUCKET=beta-spray-dev-backup
PRD_NAMESPACE=beta-spray
DOCKER_BACKUP_DIR=/backups/
TMP_DIR=/tmp/beta-spray-backups/
API_DIR=$(git rev-parse --show-toplevel)/api

# Back up current db/media
backup() {
    $API_DIR/m.sh dbbackup --clean
    $API_DIR/m.sh mediabackup --clean
}

# Restore latest backup to db/media
restore() {
    $API_DIR/m.sh dbrestore --noinput
    $API_DIR/m.sh mediarestore --noinput
}

# Restore latest backup in the current kube namespace (includes prod safety check)
restore_kube() {
    echo "Restoring to kube namespace doesn't work (yet)"
    exit 1
    kube_namespace=$(kubectl config view -o jsonpath='{..namespace}')

    # Make sure we're not accidentally shipping to prd
    if [ $kube_namespace = $PRD_NAMESPACE ]; then
        echo "Cannot restore to protected namespace $PRD_NAMESPACE"
        exit 1
    fi

    echo "Restoring latest backup to $pod_namespace..."
    # TODO finish this part
}

# Download latest backup from production, and restore it to the local DB
download() {
    # Download latest backup from production and load it into our local DB
    echo "Downloading latest backup files..."
    download_to_docker backup-db
    download_to_docker backup-media

    echo "Restoring into local DB..."
    run_in_docker ./scripts/db.sh restore

    anonymize
}

# Back up current local DB/media and upload to the dev backup bucket
upload() {
    # Generally local DB should be anonymous already, but do it again to be safe
    anonymize

    echo "Backing up local DB..."
    run_in_docker ./scripts/db.sh backup

    echo "Copying data from container..."
    rm -rf $TMP_DIR # Make sure there's nothing lingering
    mkdir -p $TMP_DIR
    docker cp $(get_api_container):$DOCKER_BACKUP_DIR $TMP_DIR

    echo "Uploading anonymized data..."
    gcloud storage cp $TMP_DIR/$DOCKER_BACKUP_DIR/* gs://$DEV_BUCKET/
    rm -rf $TMP_DIR # Don't leave a mess
}

# Anonymize current database tables
anonymize() {
    echo "Anonymizing data..."
    $API_DIR/m.sh anonymize
}

# Get name of the local API docker container
get_api_container() {
    docker-compose ps api --format json | jq -r .[0].Name
}

run_in_docker() {
    docker exec -e DJANGO_SETTINGS_MODULE=beta_spray.settings.settings_local_backup \
        $(get_api_container) "$@"
}

# Download files from the *production* backup bucket, using the given pattern
# filter, and copy them into the running APi docker container
download_to_docker() {
    pattern=$1
    # Get latest file matching pattern
    gcs_file=$(gcloud storage ls gs://$PRD_BUCKET/*$pattern* | sort | tail -1)
    dest_file=$TMP_DIR/$(basename $gcs_file)
    container=$(get_api_container)

    # Download file, then copy into docker container
    mkdir -p $TMP_DIR
    gcloud storage cp $gcs_file $dest_file
    echo "Copying $dest_file => $container:$DOCKER_BACKUP_DIR"
    run_in_docker mkdir -p $DOCKER_BACKUP_DIR
    docker cp $dest_file $container:$DOCKER_BACKUP_DIR
    rm -rf $TMP_DIR
}

case "${1}" in
    backup) backup ;;
    restore) restore ;;
    restore-kube) restore_kube ;;
    download) download ;;
    upload) upload ;;
    *) echo 'Specify `download`, `upload`, or `restore`' ;;
esac
