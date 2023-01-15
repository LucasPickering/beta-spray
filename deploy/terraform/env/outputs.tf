output "api_gcp_key" {
  value       = google_service_account_key.api_sa_key.private_key
  description = "Private key for API=>GCP service account"
  sensitive   = true
}

output "api_secret_key" {
  value       = random_password.api_secret_key.result
  description = "Generated API secret key"
  sensitive   = true
}

output "database_password" {
  value       = random_password.database_password.result
  description = "Generated database password"
  sensitive   = true
}

output "gcp_region" {
  value       = var.gcp_region
  description = "GCP Region"
}

output "gcp_project_id" {
  value       = var.gcp_project_id
  description = "GCP Project ID"
}

output "hostname" {
  value       = cloudflare_record.main.hostname
  description = "Hostname that the web app will be served at"
}

output "media_bucket" {
  value       = google_storage_bucket.media.name
  description = "GCS bucket for media upload"
}

output "tls_cert" {
  value       = cloudflare_origin_ca_certificate.main.certificate
  description = "TLS certificate"
  sensitive   = true
}

output "tls_key" {
  value       = tls_private_key.main.private_key_pem
  description = "TLS private key"
  sensitive   = true
}
