module "kms" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-kms.zip"

  providers = {
    aws           = aws
    aws.us-east-1 = aws.us-east-1
  }

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region

  name                 = "main"
  deletion_window      = var.kms_deletion_window
  alias                = "alias/${local.csi}"
  key_policy_documents = [data.aws_iam_policy_document.kms.json]
  iam_delegation       = true
}
