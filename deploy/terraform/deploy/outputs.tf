output "gcp_region" {
  value       = var.gcp_region
  description = "GCP Region"
}

output "gcp_project_id" {
  value       = var.gcp_project_id
  description = "GCP Project ID"
}

output "media_bucket" {
  value       = google_storage_bucket.media.name
  description = "GCS bucket for media upload"
}
