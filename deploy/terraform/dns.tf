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

provider "cloudflare" {
  email     = var.cloudflare_email
  api_token = var.cloudflare_api_token
}

resource "cloudflare_record" "beta_spray" {
  zone_id = var.cloudflare_zone_id
  name    = var.domain_name
  value   = google_compute_address.public_host_ip.address
  type    = "A"
  ttl     = 1
  proxied = true
}
