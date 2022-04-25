variable "hostname" {
  default     = "betaspray.lucaspickering.me"
  description = "Address the webapp is hosted at"
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
  # East1 gets the free GCS deal
  default     = "us-east1"
  description = "GCP region"
}
