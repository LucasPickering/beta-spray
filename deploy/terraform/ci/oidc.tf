resource "google_service_account" "service_account" {
  project      = var.project_id
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
      attribute = "attribute.repository/user/repo"
    }
  }
}

# https://cloud.google.com/blog/products/identity-security/enabling-keyless-authentication-from-github-actions
resource "google_service_account_iam_member" "provider_workload_identity" {
  service_account_id = google_service_account.service_account.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${module.oidc.pool_name}/attribute.repository/LucasPickering/beta-spray"
}
