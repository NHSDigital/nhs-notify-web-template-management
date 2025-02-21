import { render, screen } from '@testing-library/react';
import { mockDeep } from 'jest-mock-extended';
import { type UseAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { NHSNotifyHeader } from '@molecules/Header/Header';

jest.mock('@aws-amplify/ui-react');

jest.mocked(useAuthenticator).mockReturnValue(
  mockDeep<UseAuthenticator>({
    authStatus: 'configuring',
  })
);

describe('Header component', () => {
  it('renders component correctly', () => {
    render(<NHSNotifyHeader />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-header-logo')).toBeInTheDocument();
    expect(screen.getByTestId('auth-link')).toBeInTheDocument();
  });
});
