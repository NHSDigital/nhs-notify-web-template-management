import { TestUserClient } from 'nhs-notify-web-template-management-ui-tests/helpers/test-user-client';

const testUserClient = new TestUserClient('.');
testUserClient.createTestUser('accessibility-test@nhs.net', 'Test-Password1');
