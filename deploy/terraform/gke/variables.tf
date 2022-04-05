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

variable "kube_api_sa" {
  default     = "api"
  description = "Name of the *Kubernetes* service account used by the API pod"
}

variable "kube_namespace" {
  default     = "default"
  description = "Kubernetes namespace to deploy into"
}

variable "kube_num_nodes" {
  default     = 1
  description = "Number of nodes in the cluster"
}

variable "media_bucket" {
  default     = "beta-spray-media"
  description = "GCS bucket for API media"
}

variable "node_machine_type" {
  default     = "e2-small"
  description = "GCE machine type for eack GKE node"
}

variable "project_id" {
  description = "GCP project id"
}

variable "region" {
  description = "GCP region"
}

variable "zone" {
  description = "Zone to deploy GKE to, within the region"
}
