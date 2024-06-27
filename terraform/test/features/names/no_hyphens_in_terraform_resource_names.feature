Feature: Compliance With Naming Standards

  Scenario: Ensure all terraform resources names don't contain hyphens
    Given I have any resource defined
    When its name metadata has "(.*)-(.*)" regex
    Then the scenario should fail
