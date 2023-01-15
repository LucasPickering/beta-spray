terraform {
  required_providers {
    cloudflare = {
      source                = "cloudflare/cloudflare"
      version               = "~> 3.0"
      configuration_aliases = [cloudflare.api_user_service_key]
    }
    github = {
      source  = "integrations/github"
      version = "4.23.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }

  required_version = ">= 1.0"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "cloudflare" {
  # We need two different cloudflare providers, one that auths via token and one
  # via user service key. The user service key has to be used for the origin CA
  # certificate
  # https://github.com/cloudflare/terraform-provider-cloudflare/issues/1919#issuecomment-1270722657
  alias                = "api_user_service_key"
  api_user_service_key = var.cloudflare_origin_ca_key
}

provider "github" {
  owner = var.github_owner
  token = var.github_token
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
