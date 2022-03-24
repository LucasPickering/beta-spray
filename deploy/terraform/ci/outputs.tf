output "project_id" {
  value       = var.project_id
  description = "GCP Project ID"
}

output "provider_name" {
  description = "Provider name"
  value       = module.oidc.provider_name
}

output "region" {
  value       = var.region
  description = "GCP Region"
}

output "service_account_email" {
  description = "Service Account email"
  value       = google_service_account.service_account.email
}

output "static_assets_bucket_url" {
  value       = "https://storage.googleapis.com/${google_storage_bucket.static_assets.name}"
  description = "Cloud Storage bucket for static assets"
}
