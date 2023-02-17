output "database_backup_role" {
  value       = google_project_iam_custom_role.database_backup.name
  description = "Name of the IAM role used to access database backup buckets"
}

output "project_id" {
  value       = var.gcp_project_id
  description = "GCP Project ID"
}

output "region" {
  value       = var.gcp_region
  description = "GCP Region"
}

output "static_assets_bucket" {
  value       = google_storage_bucket.static_assets.name
  description = "Cloud Storage bucket for static assets"
}
