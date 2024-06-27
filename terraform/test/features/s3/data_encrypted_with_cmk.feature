Feature: S3 related general feature

    Scenario: Data must be encrypted at rest using a KMS CMK or AES256
      Given I have aws_s3_bucket defined
      Then it must have aws_s3_bucket_server_side_encryption_configuration
      Then it must contain rule
      Then it must contain apply_server_side_encryption_by_default
      Then it must contain sse_algorithm
      And its value must match the "(aws:kms|AES256)" regex
