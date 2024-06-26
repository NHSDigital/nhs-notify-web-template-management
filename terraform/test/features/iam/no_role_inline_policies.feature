Feature: IAM policies
  Ensure all IAM resources comply with local policy

  Scenario: Ensure no inline policies are defined for IAM Roles
    Given I have aws_iam_role_policy defined
    Then the scenario should fail
