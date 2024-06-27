Feature: IAM policies
  Scenario: Ensure AdministratorAccess policy is not attached to any role
    Given I have aws_iam_role_policy_attachment defined
    When it has policy_arn
    Then it must have policy_arn
    And its value must not match the ".*AdministratorAccess" regex
