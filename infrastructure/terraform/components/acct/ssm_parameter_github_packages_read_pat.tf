resource "aws_ssm_parameter" "github_packages_read_pat" {
  name        = "/${local.csi}/github_packages_read_pat"
  description = "A GitHub PAT token with read:packages scope, used by Amplify to download packages from GitHub package repo"
  type        = "SecureString"
  value       = try(var.initial_cli_secrets_provision_override.github_packages_read_pat, "UNSET")

  lifecycle {
    ignore_changes = [value]
  }
}

# This can be set at provision time like:
# PARAM_OBJECT=$(jq -n \
#   --arg github_packages_read_pat "github_pat_123abc" \
#   '{github_packages_read_pat:$github_packages_read_pat}' | jq -R)
# .bin/terraform <args> .. -a apply -- -var="initial_cli_secrets_provision_override=${PARAM_OBJECT}"
