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
