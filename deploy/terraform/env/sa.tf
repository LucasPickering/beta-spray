# Service accounts. Note: some permissions may be configured elsewhere

resource "google_service_account" "api_service_account" {
  account_id   = "api-pod-${terraform.workspace}"
  display_name = "API Pod Service Account"
  description  = "Service account for the API to access GCP resources"
}

# Technically we should be using workload identity instead of a static key, but
# afaict there's no DO->GCP connector so we're stuck with this for now
resource "google_service_account_key" "api_sa_key" {
  service_account_id = google_service_account.api_service_account.name
}

resource "google_service_account" "database_backup_service_account" {
  account_id   = "db-backup-pod-${terraform.workspace}"
  display_name = "Database Backup Service Account"
  description  = "Service account for the database backup pod to access GCP resources"
}

resource "google_service_account_key" "database_backup_sa_key" {
  service_account_id = google_service_account.database_backup_service_account.name
}
