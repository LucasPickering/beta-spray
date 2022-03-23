variable "static_assets_bucket" {
  description = "Name of storage bucket to store static assets"
  default     = "beta-spray-static"
}

resource "google_storage_bucket" "static_assets" {
  name                        = var.static_assets_bucket
  location                    = "US-EAST4"
  force_destroy               = true
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_binding" "static_assets" {
  bucket = google_storage_bucket.static_assets.name
  role   = "roles/storage.objectViewer"
  members = [
    "allUsers"
  ]
}
