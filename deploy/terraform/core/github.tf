# Create GH Actions secrets to auth with GCP

locals {
  # Use a mapping so we don't have to repeat a ton of boilerplate
  secrets = {
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

# Create a service account for the keskne project, to access GKE
module "keskne" {
  source                  = "github.com/LucasPickering/keskne//terraform/modules/github-ci"
  github_repository_owner = "LucasPickering"
  github_repository       = "beta-spray"
  service_account_id      = "beta-spray-github-ci-sa"
}
