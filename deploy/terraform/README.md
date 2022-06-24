# Terraform

The Terraform for this app is split into three segments:

- `ci` - CI infrastructure for building the app
- `server` - DNS and other underlying resources for a singular deployment
- `app` - Helm deployment for the actual app

These need to be applied in the above order, because of dependencies.

## Prereqs

You will need the following tools:

- google-cloud-sdk (not required for app-only releases)
- terraform

## CI

Includes:

- OIDC for GitHub to auth with ([see here](https://github.com/google-github-actions/auth#setup))
- GCS static assets bucket
- GitHub Actions secrets to auth with GCP

### Setup

1. Generate a GitHub Personal Access Token
   1. [Go here](https://github.com/settings/tokens)
   2. Create a new token with the "workflow" scope
2. Auth to Google with `gcloud auth login`
3. Create a new file `terraform.tfvars`
4. Set the following fields:
   1. `gcp_project_id` - from GCP
   2. `github_token` - the thing you just generated
5. `terraform init`

Then apply changes with:

```sh
terraform apply
```

## Server

Includes:

- DNS rules in Cloudflare
- TLS cert
- GCS Media bucket
- GCP Service Account to enable the API pod to access GCS

### Setup

1. Generate a Cloudflare API Token
   1. [Go here](https://dash.cloudflare.com/profile/api-tokens)
   2. Use the "Edit zone DNS" template
   3. Add `betaspray.net` as the only accessible zone
2. Generate a Cloudflare Origin Certificate
3. [Go here](https://dash.cloudflare.com/18653cdc99023539e99c2c866a0a6e54/betaspray.net/ssl-tls/origin)
   1. Create Certificate
   2. Set `*.betaspray.net` and `betaspray.net` as the hosts (wildcard rule is needed for `www` subdomain)
4. Auth to Google with `gcloud auth login`
5. Create a new file `terraform.tfvars`
6. Set the following fields:
   1. `gcp_project_id` - from GCP
   2. `cloudflare_api_token` - the thing you just generated
   3. `cloudflare_origin_ca_key` - the other thing you just generated
7. `terraform init`

Then apply changes with:

```sh
terraform apply
```

## App

Includes:

- Helm release to deploy the app

You can run a release with (from the repo root):

```sh
./deploy/deploy.sh
```

You should use the script instead of manually running `terraform apply` so that the correct git version is used, and the `deployed` git tag gets updated
