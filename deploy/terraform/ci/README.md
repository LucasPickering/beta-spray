This Terraform generates the infrastructure needed for CI, including:

- OIDC for GitHub to auth with ([see here](https://github.com/google-github-actions/auth#setup))
- Static assets bucket
- GitHub Actions secrets to auth with GCP

## First Time Setup

### Prereqs

- google-cloud-sdk
- Terraform

### Setup

1. Create a new file `terraform.tfvars`
2. Set the following fields:
   1. `gcp_project_id`
3. Auth to Google with `gcloud auth login`
4. Generate a GitHub Personal Access Token
   1. [Go here](https://github.com/settings/tokens)
   2. Create a new token with the "workflow" scope
   3. Add that token to `terraform.tfvars` under the name `github_token`
5. `terraform init`

Now, you can run Terraform with:

```sh
terraform apply
```

If you make any changes, just run the last command to update.
