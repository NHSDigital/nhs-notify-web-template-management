Feature: S3 related general feature

    Scenario: Data stored in S3 has versioning enabled
      Given I have aws_s3_bucket defined
      Then it must have aws_s3_bucket_versioning
      Then it must have versioning_configuration
      Then it must contain status
      And its value must be "Enabled"
