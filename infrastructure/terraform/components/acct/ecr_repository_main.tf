resource "aws_ecr_repository" "main" {
  name                 = local.csi
  image_tag_mutability = "MUTABLE"

  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = module.kms_ecr.key_arn
  }

  image_scanning_configuration {
    scan_on_push = true
  }
}
