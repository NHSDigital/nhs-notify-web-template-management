Feature: IAM policies

    Scenario: IAM Role policies should not allow underscores
      Given I have aws_iam_policy defined
      When it has name
      Then it must contain name
      And Then its value must not match the "(.*)_(.*)" regex
