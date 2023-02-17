# This is where we import remote state from other projects

data "terraform_remote_state" "keskne" {
  backend = "gcs"

  config = {
    bucket = "keskne-tfstate"
    prefix = "keskne"
  }
}

data "terraform_remote_state" "core" {
  backend = "gcs"

  config = {
    bucket = "beta-spray-tfstate"
    prefix = "core"
  }
}
