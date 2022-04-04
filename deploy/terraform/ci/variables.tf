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

variable "project_id" {
  description = "GCP project id"
}

variable "region" {
  description = "GCP region"
}

variable "static_assets_bucket" {
  description = "Name of storage bucket to store static assets"
  default     = "beta-spray-static"
}
