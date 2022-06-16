# GCS buckets and corresponding permissions

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
