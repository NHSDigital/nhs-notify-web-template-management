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
  it('should contain the logo', () => {
    render(<NHSNotifyHeader />);

    expect(screen.getByTestId('page-header-logo')).toBeInTheDocument();
  });

  it('should contain an authentication link', () => {
    render(<NHSNotifyHeader />);

    expect(screen.getByTestId('sign-in-link')).toBeInTheDocument();
  });

  it('should render correctly', () => {
    const container = render(<NHSNotifyHeader />);

    expect(container.asFragment()).toMatchSnapshot();
  });
});
