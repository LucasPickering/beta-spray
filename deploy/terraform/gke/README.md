This Terraform builds all the infrastructure needed for a deployment of the app, including:

- GKE cluster
- Media GCS bucket

## First Time Setup

### Prereqs

- helm
- kubectl
- google-cloud-sdk
- terraform

### Setup

Run:

```sh
gcloud auth application-default login
# do the login
cd deploy/terraform/gke
terraform init
```

### Kubectl

To point `kubectl` at the GKE cluster:

```sh
gcloud container clusters get-credentials $(terraform output -raw kube_cluster_name) --region $(terraform output -raw region)
```

### Helm

#### First Time Setup

First time helm install/upgrade will require:

```sh
cd deploy
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm dependency build helm/
```

(this is because helm is trash)

Then generate secrets with:

(TODO generate secrets in TF)

```sh
./scripts/secrets.sh
```

#### Release

```sh
cd deploy
./scripts/deploy.sh
```
