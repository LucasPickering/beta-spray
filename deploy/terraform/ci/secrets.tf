# Create GH Actions secrets to auth with GCP

resource "github_actions_secret" "google_workload_id_provider" {
  repository      = var.github_repository
  secret_name     = "google_workload_id_provider"
  plaintext_value = module.oidc.provider_name
}

resource "github_actions_secret" "google_service_account" {
  repository      = var.github_repository
  secret_name     = "google_service_account"
  plaintext_value = google_service_account.service_account.email
}
