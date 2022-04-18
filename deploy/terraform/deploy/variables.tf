variable "hostname" {
  default     = "betaspray.lucaspickering.me"
  description = "Address the webapp is hosted at"
}

variable "kube_api_sa" {
  default     = "api"
  description = "Name of the *Kubernetes* service account used by the API pod"
}

variable "kube_config_path" {
  default     = "~/.kube/config"
  description = "Path to local Kubernetes config file"
}

variable "kube_namespace" {
  default     = "beta-spray"
  description = "Kubernetes namespace to deploy into"
}

variable "media_bucket" {
  default     = "beta-spray-media"
  description = "GCS bucket for API media"
}

variable "gcp_project_id" {
  description = "GCP project id"
}

variable "gcp_region" {
  description = "GCP region"
}
