import { Authenticator } from '@aws-amplify/ui-react';
import { render, screen } from '@testing-library/react';
import { NHSNotifyHeader } from '@molecules/Header/Header';

describe('Header component', () => {
  it('renders component correctly', () => {
    render(
      <Authenticator.Provider>
        <NHSNotifyHeader loginRedirectURL='url' />
      </Authenticator.Provider>
    );

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-header-logo')).toBeInTheDocument();
  });
});
