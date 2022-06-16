terraform {
  backend "gcs" {
    bucket = "beta-spray-tfstate"
    prefix = "app"
  }
}
