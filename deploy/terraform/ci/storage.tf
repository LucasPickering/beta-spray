resource "google_storage_bucket" "static_assets" {
  name                        = var.static_assets_bucket
  location                    = var.region
  force_destroy               = true
  uniform_bucket_level_access = true
}

# Everyone can read
resource "google_storage_bucket_iam_binding" "static_assets_read" {
  bucket  = google_storage_bucket.static_assets.name
  role    = "roles/storage.objectViewer"
  members = ["allUsers"]
}

# GitHub CI can upload objects
resource "google_storage_bucket_iam_binding" "static_assets_write" {
  bucket  = google_storage_bucket.static_assets.name
  role    = "roles/storage.admin" # TODO downgrade to storage.objectCreator
  members = ["serviceAccount:${google_service_account.service_account.email}"]
}
