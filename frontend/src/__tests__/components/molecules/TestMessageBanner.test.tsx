import { render, screen } from '@testing-library/react';
import { TestMessageBanner } from '@molecules/TestMessageBanner/TestMessageBanner';
import { DigitalTemplateType } from 'nhs-notify-web-template-management-utils';

describe('TestMessageBanner', () => {
  it('matches snapshot for NHS_APP template type', () => {
    render(<TestMessageBanner templateType='NHS_APP' templateId='template-123' />);

    expect(screen.getByTestId('test-message-banner')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Send a test NHS App message' })
    ).toHaveAttribute('href', '/templates/send-test-nhs-app-message/template-123');
    expect(screen.getByText(/this is only a basic preview/i)).toBeVisible();
  });

  it('renders for SMS template type', () => {
    render(<TestMessageBanner templateType='SMS' templateId='template-456' />);

    expect(screen.getByTestId('test-message-banner')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Send a test text message' })
    ).toHaveAttribute('href', '/templates/send-test-text-message/template-456');
  });

  it('renders for email template type', () => {
    render(<TestMessageBanner templateType='EMAIL' templateId='template-789' />);

    expect(screen.getByTestId('test-message-banner')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Send a test email' })
    ).toHaveAttribute('href', '/templates/send-test-email-message/template-789');
  });

  it.each<[DigitalTemplateType, string]>([
    ['NHS_APP', 'template-123'],
    ['SMS', 'template-456'],
    ['EMAIL', 'template-789'],
  ])('matches snapshot for %s template type', (templateType, templateId) => {
    const { container } = render(
      <TestMessageBanner templateType={templateType} templateId={templateId} />
    );

    expect(container).toMatchSnapshot();
  });
});
