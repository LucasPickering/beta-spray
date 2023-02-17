# This role is needed for every environment to access its respective backup
# bucket, so we have to define the role once here
resource "google_project_iam_custom_role" "database_backup" {
  role_id     = "storage.databaseBackup"
  title       = "Database Backup storage user"
  description = "Role to upload database backup objects to a bucket"
  permissions = [
    "storage.buckets.get",
    "storage.objects.create",
    "storage.objects.delete", # Needed to overwrite
    "storage.multipartUploads.create",
    "storage.multipartUploads.abort",
    "storage.multipartUploads.listParts",
  ]
}
