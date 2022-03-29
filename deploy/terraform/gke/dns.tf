resource "cloudflare_record" "beta_spray" {
  zone_id = var.cloudflare_zone_id
  name    = var.domain_name
  value   = google_compute_address.public_host_ip.address
  type    = "A"
  ttl     = 1
  proxied = true
}
