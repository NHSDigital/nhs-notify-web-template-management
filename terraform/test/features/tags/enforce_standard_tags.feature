Feature: Tag Compliance

  Scenario Outline: Ensure all resources have the expected provider-level tags
    Given I have resource that supports tags_all defined
    When it has tags_all
    Then it must contain tags_all
    Then it must contain "<tags>"
    And its value must match the "<value>" regex

    Examples:
      | tags              | value                  |
      | AccountId         | [0-9]{12}              |
      | AccountName       | notify\-[a-z]{2,3}\-[a-z]+ |
      | Component         | .+                     |
      | Environment       | [a-z0-9\-]{3,15}       |
      | Project           | template-mgmt          |
