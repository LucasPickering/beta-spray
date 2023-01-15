variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_origin_ca_key" {
  description = "Cloudflare Origin CA key (different from API token)"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone" {
  description = "Cloudflare DNS zone name"
  default     = "betaspray.net"
  type        = string
}

variable "deployment_branch_policy" {
  description = "Deployment branch policy for GitHub Actions Environment"
  type = object({
    protected_branches     = bool
    custom_branch_policies = bool
  })
  default = {
    protected_branches     = false
    custom_branch_policies = false
  }
}

variable "dns_a_record" {
  description = "Name for the primary DNS A record. For non-root records, just provide the subdomain."
  type        = string
}

variable "dns_cname_records" {
  description = "A list of domain names to create CNAME records for. Each will resolve to the primary A record."
  default     = []
  type        = set(string)
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
}

variable "media_bucket" {
  description = "GCS bucket for API media"
  type        = string
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

variable "kube_namespace" {
  description = "Kubernetes namespace to deploy into"
  type        = string
}
