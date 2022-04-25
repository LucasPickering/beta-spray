variable "github_owner" {
  description = "GitHub repository owner"
  default     = "LucasPickering"
}

variable "github_repository" {
  description = "GitHub repository name"
  default     = "beta-spray"
}

variable "github_token" {
  description = "GitHub Personal Access Token"
}

variable "gcp_project_id" {
  description = "GCP project id"
}

variable "gcp_region" {
  # East1 gets the free GCS deal
  description = "GCP region"
  default     = "us-east1"
}

variable "static_assets_bucket" {
  description = "Name of storage bucket to store static assets"
  default     = "beta-spray-static"
}
