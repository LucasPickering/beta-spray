variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
}

variable "cloudflare_origin_ca_key" {
  description = "Cloudflare Origin CA key (different from API token)"
  type        = string
}

variable "cloudflare_zone" {
  default     = "betaspray.net"
  description = "Cloudflare DNS zone name"
  type        = string
}

variable "media_bucket" {
  default     = "beta-spray-media"
  description = "GCS bucket for API media"
  type        = string
}

variable "gcp_project_id" {
  description = "GCP project id"
  type        = string
}

variable "gcp_region" {
  # Always Free for storage isn't available in east4
  # https://cloud.google.com/storage/pricing#cloud-storage-always-free
  description = "GCP region"
  default     = "us-east1"
  type        = string
}
