Feature: IAM policies

    Scenario: IAM Role policies should not allow a "*" action
      Given I have aws_iam_policy defined
      When it has policy
      Then it must have policy
      When it has statement
      Then it must have statement
      When its effect is Allow
      Then it must have action
      And its value must not be *
