/* eslint-disable unicorn/no-document-cookie */
import { render } from '@testing-library/react';
import { LoginStatus } from '@molecules/LoginStatus/LoginStatus';
import { a } from '@aws-amplify/backend';

test('LoginStatus - no cookie', () => {
  document.cookie = '';

  const container = render(<LoginStatus />);

  expect(container.asFragment()).toMatchSnapshot();
});

test('LoginStatus - invalid cookie', () => {
  document.cookie = 'CognitoIdentityServiceProvider.idToken=lemons';

  const container = render(<LoginStatus />);

  expect(container.asFragment()).toMatchSnapshot();
});

test('LoginStatus - valid cookie', () => {
  document.cookie =
    'CognitoIdentityServiceProvider.idToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxvY2FsaG9zdEBuaHMubmV0In0.R0rk7pjJoU07efveI4p6W-xrTM-BnP8N-pU-RYczPBA'; // gitleaks:allow

  const container = render(<LoginStatus />);

  expect(container.asFragment()).toMatchSnapshot();
});
