resource "google_service_account" "service_account" {
  account_id   = "github-ci-sa"
  display_name = "GitHub CI Service Account"
  description  = "Service account for GitHub CI to access GCP"
}

module "oidc" {
  source      = "terraform-google-modules/github-actions-runners/google//modules/gh-oidc"
  project_id  = var.project_id
  pool_id     = "github-pool"
  provider_id = "github-provider"
  sa_mapping = {
    (google_service_account.service_account.account_id) = {
      sa_name   = google_service_account.service_account.name
      attribute = "attribute.repository/LucasPickering/beta-spray"
    }
  }
}
