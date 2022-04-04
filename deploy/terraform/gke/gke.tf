# GKE cluster
# https://github.com/Neutrollized/free-tier-gke

resource "google_container_cluster" "primary" {
  name       = "${var.project_id}-gke"
  location   = "${var.region}-${var.zone}"
  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name
  # enable_autopilot         = false
  remove_default_node_pool = true
  initial_node_count       = 1

  # Allow pods to use workload ID for SA auth
  workload_identity_config {
    workload_pool = local.workload_pool
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name = "${google_container_cluster.primary.name}-node-pool"
  # Have to specify zone to get the free management price
  cluster    = google_container_cluster.primary.name
  location   = google_container_cluster.primary.location
  node_count = var.kube_num_nodes

  node_config {
    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]

    labels = {
      env = var.project_id
    }

    preemptible  = true # Makes it cheaper
    machine_type = "e2-small"
    tags         = ["gke-node", "${var.project_id}-gke"]
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
}
