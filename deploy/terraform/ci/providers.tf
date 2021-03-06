terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      # Upgrade after https://github.com/hashicorp/terraform-provider-google/issues/10782
      version = "4.3.0"
    }

    github = {
      source  = "integrations/github"
      version = "4.23.0"
    }
  }

  required_version = ">= 1.0"
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "github" {
  owner = var.github_owner
  token = var.github_token
}
