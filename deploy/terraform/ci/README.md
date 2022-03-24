This Terraform generates the infrastructure needed for CI, including:

- OIDC for GitHub to auth with ([see here](https://github.com/google-github-actions/auth#setup))
- Static assets bucket

## CI Setup

After running this Terraform, you'll need to copy some values into GitHub so they can be accessed in the CI. Create the followed repository secrets, with values based on Terraform output:

- `GOOGLE_SERVICE_ACCOUNT` - Value of `service_account_email` output
- `GOOGLE_WORKLOAD_ID_PROVIDER` - Value of `provider_name` output
