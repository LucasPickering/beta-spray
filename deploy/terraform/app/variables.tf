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

variable "hostname" {
  default     = "betaspray.net"
  description = "Address the webapp is hosted at"
  type        = string
}

variable "kube_config_path" {
  default     = "~/.kube/config"
  description = "Path to local Kubernetes config file"
  type        = string
}

variable "kube_namespace" {
  default     = "beta-spray"
  description = "Kubernetes namespace to deploy into"
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
  # East1 gets the free GCS deal
  default     = "us-east1"
  description = "GCP region"
  type        = string
}

variable "version_sha" {
  description = "Git SHA of the version of the app to deploy. Typically the output of `git rev-parse origin/master`"
  type        = string
}
