import { render, screen } from '@testing-library/react';
import { PreviewTemplateDetailsBanner } from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsBanner';
import {
  NHS_APP_TEMPLATE,
  EMAIL_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import { DigitalTemplate } from 'nhs-notify-web-template-management-utils';

describe('PreviewTemplateDetailsBanner', () => {
  test.each<[string, string, DigitalTemplate]>([
    ['nhs-app-message', 'Send a test NHS App message', NHS_APP_TEMPLATE],
    ['email', 'Send a test email', EMAIL_TEMPLATE],
    ['text-message', 'Send a test text message', SMS_TEMPLATE],
  ])(
    'should show test message banner when digital proofing is enabled for %s template',
    (slug, linkName, template) => {
      const container = render(
        <PreviewTemplateDetailsBanner
          digitalProofingEnabled={true}
          template={{
            ...template,
            id: 'template-id-123',
          }}
        />
      );

      expect(
        screen.queryByTestId('request-proof-message-banner-link')
      ).not.toBeInTheDocument();

      expect(screen.getByTestId('test-message-banner')).toBeInTheDocument();

      expect(screen.getByRole('link', { name: linkName })).toHaveAttribute(
        'href',
        `/templates/send-test-${slug}/template-id-123`
      );

      expect(container.asFragment()).toMatchSnapshot();
    }
  );

  test.each<[string, DigitalTemplate]>([
    ['NHS_APP', NHS_APP_TEMPLATE],
    ['EMAIL', EMAIL_TEMPLATE],
    ['SMS', SMS_TEMPLATE],
  ])(
    'should show request proof banner when digital proofing is disabled for %s template',
    (_, template) => {
      const container = render(
        <PreviewTemplateDetailsBanner
          digitalProofingEnabled={false}
          template={{
            ...template,
            id: 'template-id-123',
          }}
        />
      );

      expect(
        screen.queryByTestId('test-message-banner')
      ).not.toBeInTheDocument();

      expect(
        screen.getByTestId('request-proof-message-banner')
      ).toBeInTheDocument();

      expect(
        screen.getByRole('link', { name: 'Request a proof' })
      ).toHaveAttribute('href', `/templates/request-a-proof/template-id-123`);

      expect(container.asFragment()).toMatchSnapshot();
    }
  );
});
