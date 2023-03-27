# Create GH Actions secrets to auth with DigitalOcean and GCP

locals {
  # Use a mapping so we don't have to repeat a ton of boilerplate
  variables = {
    CLUSTER_NAME = var.kubernetes_cluster_name
  }
  secrets = {
    DIGITALOCEAN_ACCESS_TOKEN   = var.digitalocean_token
    GOOGLE_WORKLOAD_ID_PROVIDER = module.oidc.provider_name
    GOOGLE_SERVICE_ACCOUNT      = google_service_account.service_account.email
  }
}

resource "github_actions_variable" "variables" {
  for_each      = local.variables
  repository    = var.github_repository
  variable_name = each.key
  value         = each.value
}

resource "github_actions_secret" "secrets" {
  for_each        = local.secrets
  repository      = var.github_repository
  secret_name     = each.key
  plaintext_value = each.value
}
