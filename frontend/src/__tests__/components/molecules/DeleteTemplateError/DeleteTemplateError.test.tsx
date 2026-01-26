import { render, screen } from '@testing-library/react';
import DeleteTemplateError from '@molecules/DeleteTemplateError/DeleteTemplateError';
import type { RoutingConfigReference } from 'nhs-notify-backend-client';

describe('DeleteTemplateError component', () => {
  test('renders template name in heading', () => {
    const messagePlans: RoutingConfigReference[] = [
      { id: '90e46ece-4a3b-47bd-b781-f986b42a5a09', name: 'Test Message Plan' },
    ];

    render(
      <DeleteTemplateError
        templateName='Test Template'
        messagePlans={messagePlans}
      />
    );

    expect(
      screen.getByText(/You cannot delete the template/)
    ).toBeInTheDocument();

    expect(screen.getByText(/'Test Template'/)).toBeInTheDocument();
  });

  test('renders single message plan', () => {
    const messagePlans: RoutingConfigReference[] = [
      { id: '90e46ece-4a3b-47bd-b781-f986b42a5a09', name: 'Single Plan' },
    ];

    render(
      <DeleteTemplateError
        templateName='My Template'
        messagePlans={messagePlans}
      />
    );

    expect(screen.getByText('Single Plan')).toBeInTheDocument();
  });

  test('renders multiple message plans', () => {
    const messagePlans: RoutingConfigReference[] = [
      { id: '90e46ece-4a3b-47bd-b781-f986b42a5a09', name: 'Message Plan 1' },
      { id: 'a0e46ece-4a3b-47bd-b781-f986b42a5a10', name: 'Message Plan 2' },
      { id: 'b0e46ece-4a3b-47bd-b781-f986b42a5a11', name: 'Message Plan 3' },
    ];

    const { container } = render(
      <DeleteTemplateError
        templateName='Test Template'
        messagePlans={messagePlans}
      />
    );

    expect(screen.getByText('Message Plan 1')).toBeInTheDocument();
    expect(screen.getByText('Message Plan 2')).toBeInTheDocument();
    expect(screen.getByText('Message Plan 3')).toBeInTheDocument();

    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(3);
  });

  test('renders back link', () => {
    const messagePlans: RoutingConfigReference[] = [
      { id: 'plan-1', name: 'Test Plan' },
    ];

    render(
      <DeleteTemplateError
        templateName='Test Template'
        messagePlans={messagePlans}
      />
    );

    const backLink = screen.getByTestId('back-link-bottom');
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/message-templates');
  });

  test('matches snapshot', () => {
    const messagePlans: RoutingConfigReference[] = [
      { id: '90e46ece-4a3b-47bd-b781-f986b42a5a09', name: 'Flu Campaign' },
      { id: 'a0e46ece-4a3b-47bd-b781-f986b42a5a10', name: 'Covid Campaign' },
    ];

    const { asFragment } = render(
      <DeleteTemplateError
        templateName='Test Template'
        messagePlans={messagePlans}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
