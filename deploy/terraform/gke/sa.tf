# Service accounts. Note: some permissions may be configured elsewhere

resource "google_service_account" "api_service_account" {
  account_id   = "api-pod"
  display_name = "API Pod Service Account"
  description  = "Service account for the API to access GCP resources"
}

# Let *Kube* SA use Workload ID, so it can auth as the *GCP* SA
# https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity#authenticating_to
resource "google_service_account_iam_binding" "api_storage_sa_workload" {
  service_account_id = google_service_account.api_service_account.name
  role               = "roles/iam.workloadIdentityUser"
  members            = ["serviceAccount:${var.project_id}.svc.id.goog[${var.kube_namespace}/${var.kube_api_sa}]"]
}
