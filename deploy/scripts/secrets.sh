#!/bin/sh

set -e

function generate_secret {
    echo $(head -c ${1:-32} /dev/urandom | base64 -w0)
}

kubectl create secret generic database-creds \
    --from-literal=database=beta_spray \
    --from-literal=username=beta_spray \
    --from-literal=password=$(generate_secret)
kubectl create secret generic api-secret-key \
    --from-literal=secret-key=$(generate_secret 128)
