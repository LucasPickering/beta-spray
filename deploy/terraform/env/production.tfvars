# A base configuration for a production environment
database_backup_bucket = "beta-spray-backup"
dns_a_record           = "betaspray.net"
dns_cname_records      = ["www"]
kube_namespace         = "beta-spray"
media_bucket           = "beta-spray-media"
deployment_branch_policy = {
  # Ideally we could use custom branch policy here, but there's no way to set
  # the branch name pattern in tf so we'd have to manually set it to `master`
  custom_branch_policies = false
  protected_branches     = true
}
