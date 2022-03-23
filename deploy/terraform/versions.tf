terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      # Upgrade after https://github.com/hashicorp/terraform-provider-google/issues/10782
      version = "4.3.0"
    }

    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "3.11.0"
    }
  }

  required_version = ">= 1.1"
}
