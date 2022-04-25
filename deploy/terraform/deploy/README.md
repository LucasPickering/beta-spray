This Terraform builds all the infrastructure needed for a deployment of the app, including:

- GKE cluster
- Media GCS bucket

## First Time Setup

### Prereqs

- helm
- kubectl
- google-cloud-sdk
- doctl
- terraform

### Setup

Run:

```sh
gcloud auth application-default login
# do the login
cd deploy/terraform/deploy
terraform init
```

### Kubectl

To point `kubectl` at the GKE cluster:

```sh
doctl kubernetes cluster kubeconfig save keskne
```

### Release

This works for both initial and subsequent releases:

```sh
terraform apply
```
