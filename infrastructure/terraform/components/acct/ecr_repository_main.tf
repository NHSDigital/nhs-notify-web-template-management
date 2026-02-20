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

resource "aws_ecr_lifecycle_policy" "main" {
  count      = var.enable_ecr_lifecycle ? 1 : 0
  repository = aws_ecr_repository.main.name

  policy = <<EOF
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Expire commit images after 30 days (commit tags use suffix '-sha-')",
      "selection": {
        "tagStatus": "tagged",
        "tagPatternList": ["*-sha-*"],
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 30
      },
      "action": {
        "type": "expire",
      }
    },
    {
      "rulePriority": 2,
      "description": "Expire (delete) untagged images 7 days after push",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 7
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 10,
      "description": "Archive tagged releaseimages (semantic-version tags), keeping the 10 most recent — do not expire them (no delete)",
      "selection": {
        "tagStatus": "tagged",
        "tagPatternList": ["*-release-*"],
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "transition",
        "targetStorageClass": "archive"
      }
    }
  ]
}
EOF
}
