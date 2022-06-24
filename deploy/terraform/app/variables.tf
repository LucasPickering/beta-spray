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

variable "version_sha" {
  # This should be supplied by the deploy.sh script
  description = "Git SHA of the version of the app to deploy. Typically the output of `git rev-parse origin/master`"
  type        = string
}
