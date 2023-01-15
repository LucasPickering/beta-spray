# Create GH Actions secrets to auth with DigitalOcean and GCP

locals {
  # Use a mapping so we don't have to repeat a ton of boilerplate
  secrets = {
    DIGITALOCEAN_ACCESS_TOKEN   = var.digitalocean_token
    GOOGLE_WORKLOAD_ID_PROVIDER = module.oidc.provider_name
    GOOGLE_SERVICE_ACCOUNT      = google_service_account.service_account.email
  }
}

resource "github_actions_secret" "secrets" {
  for_each        = local.secrets
  repository      = var.github_repository
  secret_name     = each.key
  plaintext_value = each.value
}

# TODO add CLUSTER_NAME repository variable after https://github.com/integrations/terraform-provider-github/issues/1479
