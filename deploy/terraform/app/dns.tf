data "cloudflare_zone" "main" {
  name = var.cloudflare_zone
}

# Import cluster IP from keskne tf
data "terraform_remote_state" "keskne" {
  backend = "gcs"

  config = {
    bucket = "keskne-tfstate"
    prefix = "keskne"
  }
}

resource "cloudflare_record" "main" {
  zone_id = data.cloudflare_zone.main.id
  name    = data.cloudflare_zone.main.name # Root record
  value   = data.terraform_remote_state.keskne.outputs.public_ip
  type    = "A"
  ttl     = 1
  proxied = true
}

resource "cloudflare_record" "www" {
  zone_id = data.cloudflare_zone.main.id
  name    = "www"
  value   = resource.cloudflare_record.main.name
  type    = "CNAME"
  ttl     = 1
  proxied = true
}
