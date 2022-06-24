# Import data from other tf states
data "terraform_remote_state" "ci" {
  backend = "gcs"

  config = {
    bucket = "beta-spray-tfstate"
    prefix = "ci"
  }
}

data "terraform_remote_state" "server" {
  backend = "gcs"

  config = {
    bucket = "beta-spray-tfstate"
    prefix = "server"
  }
}

resource "helm_release" "beta_spray" {
  name             = "beta-spray"
  chart            = "./helm"
  namespace        = var.kube_namespace
  create_namespace = true

  set {
    name  = "hostname"
    value = data.terraform_remote_state.server.outputs.hostname
  }
  set {
    name  = "versionSha"
    value = var.version_sha
  }
  set {
    name  = "mediaBucket"
    value = data.terraform_remote_state.server.outputs.media_bucket
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
    value = data.terraform_remote_state.server.outputs.api_gcp_key
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
    value = data.terraform_remote_state.server.outputs.tls_cert
  }
  set_sensitive {
    name  = "tlsKey"
    value = data.terraform_remote_state.server.outputs.tls_key
  }
}


# TODO encrypt tfstate https://www.terraform.io/language/settings/backends/gcs#encryption_key

resource "random_password" "database_password" {
  length = 24
}

resource "random_password" "api_secret_key" {
  length = 32
}
