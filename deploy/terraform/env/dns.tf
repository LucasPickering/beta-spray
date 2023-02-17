data "cloudflare_zone" "main" {
  name = var.cloudflare_zone
}

resource "cloudflare_record" "main" {
  zone_id = data.cloudflare_zone.main.id
  name    = var.dns_a_record
  value   = data.terraform_remote_state.keskne.outputs.public_ip
  type    = "A"
  ttl     = 1
  proxied = true
}

resource "cloudflare_record" "cname" {
  # Create one CNAME record per entry in the list
  for_each = var.dns_cname_records
  name     = each.key
  value    = resource.cloudflare_record.main.name
  zone_id  = data.cloudflare_zone.main.id
  type     = "CNAME"
  ttl      = 1
  proxied  = true
}
