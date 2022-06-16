resource "helm_release" "beta_spray" {
  name             = "beta-spray"
  chart            = "./helm"
  namespace        = var.kube_namespace
  create_namespace = true

  set {
    name  = "hostname"
    value = var.hostname
  }
  set {
    name  = "versionSha"
    value = var.version_sha
  }
  set {
    name  = "mediaBucket"
    value = google_storage_bucket.media.name
  }
  set {
    name  = "staticAssetsHost"
    value = "storage.googleapis.com"
  }
  set {
    name  = "staticAssetsBucket"
    value = data.terraform_remote_state.ci.outputs.static_assets_bucket
  }

  # Secret values - the actual secrets are created by helm in secrets.yml
  set_sensitive {
    name  = "apiGcpKey"
    value = google_service_account_key.api_sa_key.private_key
  }
  set_sensitive {
    name  = "apiSecretKey"
    value = random_password.api_secret_key.result
  }
  set_sensitive {
    name  = "databasePassword"
    value = random_password.database_password.result
  }
  set_sensitive {
    name  = "tlsCert"
    value = cloudflare_origin_ca_certificate.main.certificate
  }
  set_sensitive {
    name  = "tlsKey"
    value = tls_private_key.main.private_key_pem
  }
}

# Import data from CI tf
data "terraform_remote_state" "ci" {
  backend = "gcs"

  config = {
    bucket = "beta-spray-tfstate"
    prefix = "ci"
  }
}

# TODO encrypt tfstate https://www.terraform.io/language/settings/backends/gcs#encryption_key

resource "random_password" "database_password" {
  length = 24
}

resource "random_password" "api_secret_key" {
  length = 32
}
