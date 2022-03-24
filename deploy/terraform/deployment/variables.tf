variable "cloudflare_zone_id" {
  description = "Cloudflare DNS zone ID"
}

variable "cloudflare_email" {
  description = "Cloudflare login email"
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
}

variable "domain_name" {
  description = "Domain name to host at, relative to domain root"
  default     = "betaspray"
}

variable "gke_username" {
  default     = ""
  description = "gke username"
}

variable "gke_password" {
  default     = ""
  description = "gke password"
}

variable "project_id" {
  description = "GCP project id"
}

variable "region" {
  description = "GCP region"
}
