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
# TODO convert some of these to configuration variables after https://github.com/integrations/terraform-provider-github/issues/1479

locals {
  # Use a mapping for secrets so we don't have to repeat a ton of boilerplate
  secrets = {
    API_GCP_KEY                = google_service_account_key.api_sa_key.private_key
    API_SECRET_KEY             = random_password.api_secret_key.result
    DATABASE_BACKUP_BUCKET     = google_storage_bucket.database_backup.name
    DATABASE_BACKUP_GCP_KEY    = google_service_account_key.database_backup_sa_key.private_key
    DATABASE_PASSWORD          = random_password.database_password.result
    GOOGLE_OAUTH_CLIENT_ID     = var.google_oauth_client_id
    GOOGLE_OAUTH_CLIENT_SECRET = var.google_oauth_client_secret
    MEDIA_BUCKET               = google_storage_bucket.media.name
    NAMESPACE                  = var.kube_namespace
    STATIC_ASSETS_BUCKET       = var.static_assets_bucket
    TLS_CERT                   = cloudflare_origin_ca_certificate.main.certificate
    TLS_KEY                    = tls_private_key.main.private_key_pem
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
