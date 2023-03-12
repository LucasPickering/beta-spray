# GCS buckets and corresponding permissions

########################
##### Media bucket #####
########################
resource "google_storage_bucket" "media" {
  name          = var.media_bucket
  location      = var.gcp_region
  force_destroy = false # Careful SpongeBob!
  # Needed for signed URLs. See GS_DEFAULT_ACL in
  # https://django-storages.readthedocs.io/en/latest/backends/gcloud.html
  uniform_bucket_level_access = false
}

# Everyone can read
resource "google_storage_bucket_iam_binding" "media_read" {
  bucket  = google_storage_bucket.media.name
  role    = "roles/storage.objectViewer"
  members = ["allUsers"]
}

# API SA can manage objects
resource "google_storage_bucket_iam_binding" "media_write" {
  bucket  = google_storage_bucket.media.name
  role    = "roles/storage.objectAdmin"
  members = ["serviceAccount:${google_service_account.api_service_account.email}"]
}


##################################
##### Database backup bucket #####
##################################
resource "google_storage_bucket" "database_backup" {
  name     = var.database_backup_bucket
  location = var.gcp_region
  versioning {
    enabled = true
  }
  lifecycle_rule {
    condition {
      days_since_noncurrent_time = 3
    }
    action {
      type = "Delete"
    }
  }
  uniform_bucket_level_access = true
}

# Backup SA can upload objects to DB Backup bucket
resource "google_storage_bucket_iam_binding" "database_backup_write" {
  bucket  = google_storage_bucket.database_backup.name
  role    = var.database_backup_role
  members = ["serviceAccount:${google_service_account.database_backup_service_account.email}"]
}
