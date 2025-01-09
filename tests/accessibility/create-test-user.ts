import { writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { TestUserClient } from './test-user-client';
import { generate } from 'generate-password';

const generateTestUser = async () => {
  const testEmail = `nhs-notify-automated-test-accessibility-test-${randomUUID()}@nhs.net`;
  const testPassword = generate({
    length: 20,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    strict: true,
  });
  const testUserClient = new TestUserClient('./frontend');
  await testUserClient.createTestUser(testEmail, testPassword);

  writeFileSync(
    './auth.json',
    JSON.stringify({ email: testEmail, password: testPassword })
  );
};

generateTestUser();
