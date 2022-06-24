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
  csr                = tls_cert_request.main.cert_request_pem
  hostnames          = [cloudflare_record.main.hostname, cloudflare_record.www.hostname]
  request_type       = "origin-rsa"
  requested_validity = 365
}
