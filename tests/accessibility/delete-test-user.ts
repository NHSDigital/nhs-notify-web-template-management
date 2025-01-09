import { readFileSync } from 'node:fs';
import { TestUserClient } from './test-user-client';

const { email } = JSON.parse(readFileSync('./auth.json', 'utf8'));

new TestUserClient('.').deleteTestUser(email);
