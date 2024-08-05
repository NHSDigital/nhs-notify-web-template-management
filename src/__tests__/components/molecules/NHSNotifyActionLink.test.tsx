import { render, screen } from '@testing-library/react';
import { NHSNotifyActionLink } from '@molecules/NHSNotifyActionLink/NHSNotifyActionLink';
import { ActionLinkType } from '@molecules/NHSNotifyActionLink/action-link.types';

const componentProps: ActionLinkType = {
  text: 'Some text',
  target: '#',
};
describe('Footer component', () => {
  it('renders component correctly', () => {
    render(<NHSNotifyActionLink {...componentProps} />);

    expect(screen.getByTestId('action-link-wrapper')).toBeInTheDocument();

    expect(screen.getByTestId('action-link')).toBeInTheDocument();
    expect(screen.getByTestId('action-link')).toHaveAttribute('href', '#');

    expect(screen.getByTestId('action-link-icon')).toBeInTheDocument();

    expect(screen.getByTestId('action-link-text')).toBeInTheDocument();
    expect(screen.getByTestId('action-link-text')).toHaveTextContent(
      componentProps.text
    );
  });
});
