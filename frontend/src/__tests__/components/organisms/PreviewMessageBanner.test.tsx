import { render, screen } from '@testing-library/react';
import {
  DigitalProofingBanner,
  RequestProofBanner,
} from '@organisms/PreviewDigitalTemplate/PreviewMessageBanner';
import type { DigitalTemplate } from 'nhs-notify-web-template-management-utils';
import {
  NHS_APP_TEMPLATE,
  EMAIL_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';

describe('PreviewMessageBanner', () => {
  describe('RequestProofBanner', () => {
    it('displays the request proof banner with the correct template id', () => {
      render(<RequestProofBanner templateId='template-123' />);

      expect(screen.getByTestId('request-proof-message-banner')).toBeVisible();

      expect(
        screen.getByRole('link', { name: 'Request a proof' })
      ).toBeVisible();
    });
  });

  describe('DigitalProofingBanner', () => {
    it('displays the request proof banner when digital proofing is disabled', () => {
      render(
        <DigitalProofingBanner
          template={{
            ...NHS_APP_TEMPLATE,
            id: 'template-123',
            templateStatus: 'NOT_YET_SUBMITTED',
          }}
          isDigitalProofingEnabled={false}
        />
      );

      expect(screen.getByTestId('request-proof-message-banner')).toBeVisible();

      expect(
        screen.queryByTestId('test-message-banner')
      ).not.toBeInTheDocument();
    });

    it.each<[string, string, string, DigitalTemplate]>([
      [
        'NHS_APP',
        'Send a test NHS App message',
        'send-test-nhs-app-message',
        NHS_APP_TEMPLATE,
      ],
      ['EMAIL', 'Send a test email', 'send-test-email', EMAIL_TEMPLATE],
      [
        'SMS',
        'Send a test text message',
        'send-test-text-message',
        SMS_TEMPLATE,
      ],
    ])(
      'displays the test message banner for a draft %s template when digital proofing is enabled',
      (_, linkName, channelSlug, template) => {
        render(
          <DigitalProofingBanner
            template={{
              ...template,
              id: 'template-123',
              templateStatus: 'NOT_YET_SUBMITTED',
            }}
            isDigitalProofingEnabled
          />
        );

        expect(screen.getByTestId('test-message-banner')).toBeVisible();

        expect(
          screen.queryByTestId('request-proof-message-banner')
        ).not.toBeInTheDocument();

        expect(screen.getByRole('link', { name: linkName })).toHaveAttribute(
          'href',
          `/templates/${channelSlug}/template-123`
        );
      }
    );

    it('displays nothing for a submitted template when digital proofing is enabled', () => {
      const { container } = render(
        <DigitalProofingBanner
          template={{
            ...NHS_APP_TEMPLATE,
            id: 'template-123',
            templateStatus: 'SUBMITTED',
          }}
          isDigitalProofingEnabled
        />
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});
