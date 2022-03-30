terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "3.11.0"
    }

    google = {
      source = "hashicorp/google"
      # Upgrade after https://github.com/hashicorp/terraform-provider-google/issues/10782
      version = "4.3.0"
    }
  }

  required_version = ">= 1.0"
}

provider "cloudflare" {
  email     = var.cloudflare_email
  api_token = var.cloudflare_api_token
}

provider "google" {
  project = var.project_id
  region  = var.region
}
