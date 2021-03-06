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
