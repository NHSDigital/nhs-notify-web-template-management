import { render, screen } from '@testing-library/react';
import { NHSNotifyButton } from '@/src/components/atoms/NHSNotifyButton/NHSNotifyButton';
import { ButtonType } from '@/src/components/atoms/NHSNotifyButton/button.types';

const buttonProps: ButtonType = {
  children: 'Button text',
};

describe('Footer component', () => {
  it('renders component correctly as a button', () => {
    render(<NHSNotifyButton {...buttonProps} />);

    expect(screen.getByTestId('link-button')).toBeInTheDocument();
    expect(screen.getByTestId('link-button')).toHaveTextContent('Button text');
  });

  it('renders component correctly as a link button', () => {
    const linkButtonProps: ButtonType = { ...buttonProps, href: '#' };
    render(<NHSNotifyButton {...linkButtonProps} />);

    expect(screen.getByTestId('link-button')).toBeInTheDocument();
    expect(screen.getByTestId('link-button')).toHaveTextContent('Button text');
    expect(screen.getByTestId('link-button')).toHaveAttribute('href', '#');
  });
});
