terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }

  required_version = ">= 1.0"
}

provider "cloudflare" {
  api_token            = var.cloudflare_api_token
  api_user_service_key = var.cloudflare_origin_ca_key
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "helm" {
  kubernetes {
    config_path = pathexpand(var.kube_config_path)
  }
}
