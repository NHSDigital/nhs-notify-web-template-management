import { PreviewTemplateFromMessagePlan } from '@molecules/PreviewTemplateFromMessagePlan/PreviewTemplateFromMessagePlan';
import { render, screen } from '@testing-library/react';
import {
  AUTHORING_LETTER_TEMPLATE,
  EMAIL_TEMPLATE,
  LARGE_PRINT_LETTER_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  ROUTING_CONFIG,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import PreviewTemplateDetailsAuthoringLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsAuthoringLetter';
import PreviewTemplateDetailsPdfLetter from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsPdfLetter';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';

type TestCase = {
  name: string;
  templateName: string;
  expectedBackLink: string;
  renderComponent: () => ReturnType<typeof render>;
};

const cases: TestCase[] = [
  {
    name: 'NHS App',
    templateName: NHS_APP_TEMPLATE.name,
    expectedBackLink: `/message-plans/choose-nhs-app-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    renderComponent: () =>
      render(
        <PreviewTemplateFromMessagePlan
          initialState={NHS_APP_TEMPLATE}
          previewComponent={PreviewTemplateDetailsNhsApp}
          routingConfigId={ROUTING_CONFIG.id}
          lockNumber={5}
        />
      ),
  },
  {
    name: 'Email',
    templateName: EMAIL_TEMPLATE.name,
    expectedBackLink: `/message-plans/choose-email-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    renderComponent: () =>
      render(
        <PreviewTemplateFromMessagePlan
          initialState={EMAIL_TEMPLATE}
          previewComponent={PreviewTemplateDetailsEmail}
          routingConfigId={ROUTING_CONFIG.id}
          lockNumber={5}
        />
      ),
  },
  {
    name: 'SMS',
    templateName: SMS_TEMPLATE.name,
    expectedBackLink: `/message-plans/choose-text-message-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    renderComponent: () =>
      render(
        <PreviewTemplateFromMessagePlan
          initialState={SMS_TEMPLATE}
          previewComponent={PreviewTemplateDetailsSms}
          routingConfigId={ROUTING_CONFIG.id}
          lockNumber={5}
        />
      ),
  },
  {
    name: 'PDF Letter',
    templateName: PDF_LETTER_TEMPLATE.name,
    expectedBackLink: `/message-plans/choose-standard-english-letter-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    renderComponent: () =>
      render(
        <PreviewTemplateFromMessagePlan
          initialState={PDF_LETTER_TEMPLATE}
          previewComponent={PreviewTemplateDetailsPdfLetter}
          routingConfigId={ROUTING_CONFIG.id}
          lockNumber={5}
        />
      ),
  },
  {
    name: 'Authoring Letter',
    templateName: AUTHORING_LETTER_TEMPLATE.name,
    expectedBackLink: `/message-plans/choose-standard-english-letter-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    renderComponent: () =>
      render(
        <PreviewTemplateFromMessagePlan
          initialState={AUTHORING_LETTER_TEMPLATE}
          previewComponent={PreviewTemplateDetailsAuthoringLetter}
          routingConfigId={ROUTING_CONFIG.id}
          lockNumber={5}
        />
      ),
  },
  {
    name: 'Large Print Letter',
    templateName: LARGE_PRINT_LETTER_TEMPLATE.name,
    expectedBackLink: `/message-plans/choose-large-print-letter-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    renderComponent: () =>
      render(
        <PreviewTemplateFromMessagePlan
          initialState={LARGE_PRINT_LETTER_TEMPLATE}
          previewComponent={PreviewTemplateDetailsPdfLetter}
          routingConfigId={ROUTING_CONFIG.id}
          lockNumber={5}
        />
      ),
  },
  {
    name: 'French Letter',
    templateName: PDF_LETTER_TEMPLATE.name,
    expectedBackLink: `/message-plans/choose-other-language-letter-template/${ROUTING_CONFIG.id}?lockNumber=5`,
    renderComponent: () =>
      render(
        <PreviewTemplateFromMessagePlan
          initialState={{ ...PDF_LETTER_TEMPLATE, language: 'fr' }}
          previewComponent={PreviewTemplateDetailsPdfLetter}
          routingConfigId={ROUTING_CONFIG.id}
          lockNumber={5}
        />
      ),
  },
];

describe('PreviewTemplateFromMessagePlan', () => {
  it.each(cases)(
    'renders $name template preview with the correct back links',
    ({ templateName, expectedBackLink, renderComponent }) => {
      const container = renderComponent();

      expect(screen.getByText(templateName)).toBeInTheDocument();

      const backLinks = screen.getAllByText('Go back');
      for (const backLink of backLinks) {
        expect(backLink).toHaveAttribute('href', expectedBackLink);
      }

      expect(container.asFragment()).toMatchSnapshot();
    }
  );
});
