# GKE cluster
resource "google_container_cluster" "primary" {
  name     = "${var.project_id}-gke"
  location = var.region

  # Autopilot mode makes the base cluster free
  # https://cloud.google.com/kubernetes-engine/pricing
  enable_autopilot = true

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  vertical_pod_autoscaling {
    enabled = true
  }
}
