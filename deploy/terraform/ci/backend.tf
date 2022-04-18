terraform {
  backend "gcs" {
    bucket = "beta-spray-tfstate"
    prefix = "ci"
  }
}
