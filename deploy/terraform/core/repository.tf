resource "github_branch_default" "master" {
  repository = var.github_repository
  branch     = "master"
}

resource "github_branch_protection" "master" {
  repository_id = var.github_repository
  pattern       = github_branch_default.master.branch

  allows_deletions                = false
  allows_force_pushes             = false
  require_conversation_resolution = false
  required_linear_history         = true
  require_signed_commits          = false

  required_status_checks {
    strict = true
    contexts = [
      "API/Build",
      "UI/Build",
      "General/Upload",
      "UI/Test",
      "API/Lint",
      "API/Test",
    ]
  }
}
