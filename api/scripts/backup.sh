#!/bin/sh

# Simple backup script for running from kube. For humans, try ./db.sh backup
./m.sh dbbackup --clean
./m.sh mediabackup --clean
