resource "tls_private_key" "main" {
  algorithm = "RSA"
}

resource "tls_cert_request" "main" {
  private_key_pem = tls_private_key.main.private_key_pem

  subject {
    common_name  = ""
    organization = "Lucas Pickering"
  }
}

resource "cloudflare_origin_ca_certificate" "main" {
  provider = cloudflare.api_user_service_key
  csr      = tls_cert_request.main.cert_request_pem
  # Include the primary A record, as well as all CNAME records, on the cert
  hostnames = concat(
    [cloudflare_record.main.hostname],
    [for r in cloudflare_record.cname : r.hostname]
  )
  request_type       = "origin-rsa"
  requested_validity = 365
}
