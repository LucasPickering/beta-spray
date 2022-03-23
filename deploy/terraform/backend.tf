terraform {
  backend "gcs" {
    bucket = "beta-spray-tfstate"
    prefix = "terraform/state"
  }
}
