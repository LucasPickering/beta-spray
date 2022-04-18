# Import data from CI tf
data "terraform_remote_state" "ci" {
  backend = "gcs"

  config = {
    bucket = "beta-spray-tfstate"
    prefix = "ci"
  }
}

resource "helm_release" "beta_spray" {
  name      = "beta-spray"
  chart     = "../../helm"
  namespace = var.kube_namespace

  set {
    name  = "hostname"
    value = var.hostname
  }
  set {
    name  = "versionSha"
    value = "ddbe9ae81853e13141ba32978f6f33585d4307b6" # TODO
  }
  set {
    name  = "mediaBucket"
    value = google_storage_bucket.media.name
  }
  set {
    name  = "apiServiceAccountName"
    value = var.kube_api_sa
  }
  set {
    name  = "apiServiceAccountEmail"
    value = google_service_account.api_service_account.email
  }
  set {
    name  = "staticAssetsHost"
    value = "storage.googleapis.com"
  }
  set {
    name  = "staticAssetsBucket"
    value = data.terraform_remote_state.ci.outputs.static_assets_bucket
  }
}

resource "kubernetes_namespace" "beta_spray" {
  metadata {
    name = var.kube_namespace
  }
}

# TODO encrypt tfstate https://www.terraform.io/language/settings/backends/gcs#encryption_key

resource "kubernetes_secret" "database_creds" {
  type = "generic"
  metadata {
    name      = "database-creds"
    namespace = var.kube_namespace
  }

  data = {
    database = "beta_spray"
    username = "beta_spray"
    password = random_password.database_password.result
  }
}

resource "random_password" "database_password" {
  length = 24
}

resource "kubernetes_secret" "api_secret_key" {
  type = "generic"
  metadata {
    name      = "api-secret-key"
    namespace = var.kube_namespace
  }

  data = {
    ("secret-key") = random_password.api_secret_key.result
  }
}

resource "random_password" "api_secret_key" {
  length = 32
}
