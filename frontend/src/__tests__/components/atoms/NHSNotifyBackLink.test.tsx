import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotifyBackLink from '@atoms/NHSNotifyBackLink/NHSNotifyBackLink';

describe('NotifyBackLink', () => {
  it('renders an anchor tag with href by default', () => {
    render(<NotifyBackLink href='/test'>Back</NotifyBackLink>);

    const link = screen.getByRole('link', { name: 'Back' });

    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renders a button when asElement is set to "button"', () => {
    render(<NotifyBackLink asElement='button'>Back</NotifyBackLink>);

    const button = screen.getByRole('button', { name: 'Back' });

    expect(button.tagName).toBe('BUTTON');
  });

  it('applies custom class names', () => {
    render(
      <NotifyBackLink className='custom-class' href='#'>
        Back
      </NotifyBackLink>
    );

    const link = screen.getByRole('link', { name: 'Back' });

    expect(link).toHaveClass('nhsuk-back-link custom-class');
  });

  it('renders children correctly', () => {
    render(<NotifyBackLink href='#'>Go back</NotifyBackLink>);

    expect(screen.getByText('Go back')).toBeInTheDocument();
  });

  it('allows additional props and handlers', () => {
    const handleClick = jest.fn();
    render(
      <NotifyBackLink
        asElement='button'
        type='button'
        onClick={handleClick}
        data-testid='test-id'
      >
        Click me
      </NotifyBackLink>
    );

    const button = screen.getByRole('button', { name: 'Click me' });

    fireEvent.click(button);

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-testid', 'test-id');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('matches snapshot (default anchor)', () => {
    const { asFragment } = render(
      <NotifyBackLink href='/somewhere'>Back</NotifyBackLink>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot when rendered as a button', () => {
    const { asFragment } = render(
      <NotifyBackLink asElement='button'>Back</NotifyBackLink>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
