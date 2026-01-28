import { PreviewTemplateFromMessagePlan } from '@molecules/PreviewTemplateFromMessagePlan/PreviewTemplateFromMessagePlan';
import { render, screen } from '@testing-library/react';
import {
  EMAIL_TEMPLATE,
  LARGE_PRINT_LETTER_TEMPLATE,
  LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  ROUTING_CONFIG,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import PreviewTemplateDetailsLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsLetter';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';

describe('PreviewTemplateFromMessagePlan', () => {
  it.each([
    {
      name: 'NHS App',
      template: { ...NHS_APP_TEMPLATE },
      previewComponent: PreviewTemplateDetailsNhsApp,
      expectedBackLink: `/message-plans/choose-nhs-app-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    },
    {
      name: 'Email',
      template: { ...EMAIL_TEMPLATE },
      previewComponent: PreviewTemplateDetailsEmail,
      expectedBackLink: `/message-plans/choose-email-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    },
    {
      name: 'SMS',
      template: { ...SMS_TEMPLATE },
      previewComponent: PreviewTemplateDetailsSms,
      expectedBackLink: `/message-plans/choose-text-message-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    },
    {
      name: 'Letter',
      template: { ...LETTER_TEMPLATE },
      previewComponent: PreviewTemplateDetailsLetter,
      expectedBackLink: `/message-plans/choose-standard-english-letter-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    },
    {
      name: 'Large Print Letter',
      template: { ...LARGE_PRINT_LETTER_TEMPLATE },
      previewComponent: PreviewTemplateDetailsLetter,
      expectedBackLink: `/message-plans/choose-large-print-letter-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    },
    {
      name: 'French Letter',
      template: { ...LETTER_TEMPLATE, language: 'fr' },
      previewComponent: PreviewTemplateDetailsLetter,
      expectedBackLink: `/message-plans/choose-other-language-letter-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    },
  ])(
    'renders $name template preview with the correct back links',
    ({ template, previewComponent, expectedBackLink }) => {
      const container = render(
        <PreviewTemplateFromMessagePlan
          initialState={template as never}
          previewComponent={previewComponent as never}
          routingConfigId={ROUTING_CONFIG.id}
          lockNumber={5}
        />
      );

      expect(screen.getByText(template.name)).toBeInTheDocument();

      const backLinks = screen.getAllByText('Go back');
      for (const backLink of backLinks) {
        expect(backLink).toHaveAttribute('href', expectedBackLink);
      }

      expect(container.asFragment()).toMatchSnapshot();
    }
  );
});
