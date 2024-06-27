Feature: S3 related general feature

    @exclude_module.security.aws_s3_bucket.bucket_access_logs
    Scenario: Every bucket in S3 has bucket logging enabled
      Given I have aws_s3_bucket defined
      Then it must have aws_s3_bucket_logging
