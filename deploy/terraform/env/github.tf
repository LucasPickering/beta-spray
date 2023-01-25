resource "github_repository_environment" "main" {
  environment = terraform.workspace
  repository  = var.github_repository

  # We need to omit this block if there are no policies enabled
  dynamic "deployment_branch_policy" {
    for_each = anytrue(values(var.deployment_branch_policy)) ? [1] : []
    content {
      protected_branches     = var.deployment_branch_policy.protected_branches
      custom_branch_policies = var.deployment_branch_policy.custom_branch_policies
    }
  }
}

data "terraform_remote_state" "core" {
  backend = "gcs"

  config = {
    bucket = "beta-spray-tfstate"
    prefix = "core"
  }
}

# TODO encrypt tfstate https://www.terraform.io/language/settings/backends/gcs#encryption_key
# Special characters seem to cause issues in helm. It's easier to avoid than fix

resource "random_password" "database_password" {
  length  = 24
  special = false
}

resource "random_password" "api_secret_key" {
  length  = 32
  special = false
}

# Add secrets to the GitHub environment, so it can be access by CI during deployment.
# Not all of these are strictly sensitive, but the GH provider doesn't allow us
# to create plaintext environment variables from here, so we just stick everything
# in secrets.
# TODO use encrypted values here? Probably not useful if we already encrypt tfstate
# TODO convert some of these to configuration variables after https://github.com/integrations/terraform-provider-github/issues/1479

locals {
  # Use a mapping for secrets so we don't have to repeat a ton of boilerplate
  secrets = {
    API_GCP_KEY          = google_service_account_key.api_sa_key.private_key
    API_SECRET_KEY       = random_password.api_secret_key.result
    DATABASE_PASSWORD    = random_password.database_password.result
    MEDIA_BUCKET         = google_storage_bucket.media.name
    NAMESPACE            = var.kube_namespace
    STATIC_ASSETS_BUCKET = data.terraform_remote_state.core.outputs.static_assets_bucket
    TLS_CERT             = cloudflare_origin_ca_certificate.main.certificate
    TLS_KEY              = tls_private_key.main.private_key_pem
    # TODO re-enable as a plain variable when possible
    # HOSTNAME             = cloudflare_record.main.hostname
  }
}

resource "github_actions_environment_secret" "secrets" {
  for_each        = local.secrets
  repository      = var.github_repository
  environment     = github_repository_environment.main.environment
  secret_name     = each.key
  plaintext_value = each.value
}