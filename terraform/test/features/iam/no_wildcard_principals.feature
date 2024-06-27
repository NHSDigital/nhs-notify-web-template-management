Feature: IAM policies

    Scenario: IAM Assume Role policies should not allow a wildcard principal
      Given I have aws_iam_role defined
      When it has assume_role_policy
      Then it must have assume_role_policy
      When it has statement
      Then it must have statement
      When its effect is Allow
      And its action is sts:AssumeRole
      Then it must contain principal
      When it has AWS
      Then it must have AWS
      And its value must not be *
