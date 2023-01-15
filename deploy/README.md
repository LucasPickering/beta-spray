# Deployment

Deployment is managed in two parts:

- Underlying core and environment-specific infrastructure is defined in Terraform, and needs to be created manually (using `terraform` commands)
- Repeated deployments are managed via Helm, and executed by the CI

## Terraform

The Terraform for this app is split into three segments:

- `ci` - CI infrastructure for building the app
- `server` - DNS and other underlying resources for a singular deployment
- `app` - Helm deployment for the actual app

These need to be applied in the above order, because of dependencies.

### Prereqs

You will need the following tools:

- google-cloud-sdk
- terraform

### Core

These are one-time "singleton" resources. Resources include:

- Google Cloud OIDC crets ([see here](https://github.com/google-github-actions/auth#setup))
- GCS static assets bucket
- GitHub Actions secrets to auth with DigitalOcean and GCP

#### Setup

1. `cd deploy/terraform/core`
1. Create a new file `secrets.auto.tfvars`
1. Generate a GitHub Personal Access Token
   1. [Go here](https://github.com/settings/tokens)
   1. Create a new token with the scopes:
      - `workflow`
      - `read:org`
      - `read:discussion`
   1. Add `github_token = "<token>"` to the `tfvars` file
1. Generate a DigitalOcean Personal Access Token
   1. [Go here](https://cloud.digitalocean.com/account/api/tokens)
   1. Create a new token with the scopes: `Read`
   1. Add `digitalocean_token = "<token>"` to the `tfvars` file
1. Auth to Google with `gcloud auth login`
1. `terraform init`

Then apply changes with:

```sh
terraform apply
```

### Environment

These are per-environment resources. This will need to be executed once for each deployment environment (development, production, etc.). Resources include:

- DNS rules in Cloudflare
- TLS cert
- GCS Media bucket
- GCP Service Account to enable the API pod to access GCS
- GitHub Actions environment and secrets

Since this project needs to be deployed multiple times, we use [Terraform workspaces](https://developer.hashicorp.com/terraform/language/state/workspaces) to manage each environment. The name of the workspace will match

#### Initial Setup

This setup only needs to be run once, then these creds can be used for all environments.

1. Create a new file `secrets.auto.tfvars`
1. Generate a Cloudflare API Token
   1. [Go here](https://dash.cloudflare.com/profile/api-tokens)
   1. Use the "Edit zone DNS" template
   1. Add `betaspray.net` as the only accessible zone
   1. Create the key
   1. Add `cloudflare_api_token = "<token>"` to the `tfvars` file
1. Access your Cloudflare Origin CA keyt
   1. [Go here](https://dash.cloudflare.com/profile/api-tokens)
   1. Click "View" for the Origin CA Key
   1. Add `cloudflare_origin_ca_key = "<key>"` to the `tfvars` file
1. Follow the steps in the Core section above to create a GitHub token (you can also re-use that token)
   1. Add `github_token = "<token>"` to the `tfvars` file
1. Auth to Google with `gcloud auth login`
1. `terraform init`

#### Per-Environment Setup

Each environment needs its own Terraform workspace. You can use `terraform workspace list` to see all the current environments (excluding `default`). Each workspace also has a corresponding `tfvars` file, which defines environment-specific variables. Each environment needs to be deploye separately, like so:

Then apply changes with:

```sh
terraform workspace select <environment>
terraform apply -var-file <environemtn>.tfvars
```

## CI

Once all the infrastructure is created with Terraform, the CI will automatically handle deployment. This is all defined in `.github/workflows/build.yml`. The deployment environment is selected based on branch name.

Generally you shouldn't need to manually deploy. If you do, you can figure it out on your own, then add instructions here :)
