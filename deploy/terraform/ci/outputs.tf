output "project_id" {
  value       = var.project_id
  description = "GCP Project ID"
}

output "region" {
  value       = var.region
  description = "GCP Region"
}

output "static_assets_bucket_url" {
  value       = "https://storage.googleapis.com/${google_storage_bucket.static_assets.name}"
  description = "Cloud Storage bucket for static assets"
}
