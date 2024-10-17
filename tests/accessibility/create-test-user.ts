import { TestUserClient } from 'nhs-notify-web-template-management-ui-tests/helpers/test-user-client';

new TestUserClient('.').createTestUser(
  'accessibility-test@nhs.net',
  'Test-Password1'
);
