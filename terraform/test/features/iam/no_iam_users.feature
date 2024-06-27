Feature: IAM policies

  Scenario: Ensure there are no IAM Users defined
    Given I have aws_iam_user defined
    Then the scenario should fail
