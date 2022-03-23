output "region" {
  value       = var.region
  description = "GCloud Region"
}

output "project_id" {
  value       = var.project_id
  description = "GCloud Project ID"
}

output "kubernetes_cluster_name" {
  value       = google_container_cluster.primary.name
  description = "GKE Cluster Name"
}

output "kubernetes_cluster_ip" {
  value       = google_container_cluster.primary.endpoint
  description = "GKE Cluster Host IP"
}

output "public_ip_name" {
  value       = google_compute_address.public_host_ip.name
  description = "Name assigned to the public IP within GCP"
}

output "public_ip" {
  value       = google_compute_address.public_host_ip.address
  description = "IP to host the site at"
}

output "public_host" {
  value       = cloudflare_record.beta_spray.hostname
  description = "Domain to host the site at"
}

output "static_assets_bucket_url" {
  value       = "https://storage.googleapis.com/${google_storage_bucket.static_assets.name}"
  description = "Cloud Storage bucket for static assets"
}
