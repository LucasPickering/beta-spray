# Import data from CI tf
data "terraform_remote_state" "ci" {
  backend = "gcs"

  config = {
    bucket = "beta-spray-tfstate"
    prefix = "ci"
  }
}

resource "helm_release" "beta_spray" {
  name             = "beta-spray"
  chart            = "../../helm"
  namespace        = var.kube_namespace
  create_namespace = true

  set {
    name  = "hostname"
    value = var.hostname
  }
  set {
    name = "versionSha"
    # TODO `git rev-parse origin/master`
    value = "ddbe9ae81853e13141ba32978f6f33585d4307b6"
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

  # Secrets
  set {
    name  = "apiSecretKey"
    value = random_password.api_secret_key.result
  }
  set {
    name  = "databasePassword"
    value = random_password.database_password.result
  }
}

# TODO encrypt tfstate https://www.terraform.io/language/settings/backends/gcs#encryption_key

resource "random_password" "database_password" {
  length = 24
}

resource "random_password" "api_secret_key" {
  length = 32
}
