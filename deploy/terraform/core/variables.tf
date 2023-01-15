variable "digitalocean_token" {
  description = "DigitalOcean Personal Access Token, to allow CI to auth with doctl"
  type        = string
  sensitive   = true
}

variable "github_owner" {
  description = "GitHub repository owner"
  default     = "LucasPickering"
  type        = string
}

variable "github_repository" {
  description = "GitHub repository name"
  default     = "beta-spray"
  type        = string
}

variable "github_token" {
  description = "GitHub Personal Access Token"
  type        = string
  sensitive   = true
}

variable "gcp_project_id" {
  description = "GCP project id"
  default     = "beta-spray"
  type        = string
}

variable "gcp_region" {
  # Always Free for storage isn't available in east4
  # https://cloud.google.com/storage/pricing#cloud-storage-always-free
  description = "GCP region"
  default     = "us-east1"
  type        = string
}

variable "static_assets_bucket" {
  description = "Name of storage bucket to store static assets"
  default     = "beta-spray-static"
  type        = string
}
