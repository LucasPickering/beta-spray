resource "google_storage_bucket" "static_assets" {
  name                        = var.static_assets_bucket
  location                    = var.gcp_region
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
  bucket = google_storage_bucket.static_assets.name
  # Theoterically, objectCreator _should_ be enough but the CI step complains
  # if it doesn't have delete permission ¯\_(ツ)_/¯
  role    = "roles/storage.objectAdmin"
  members = ["serviceAccount:${google_service_account.service_account.email}"]
}
