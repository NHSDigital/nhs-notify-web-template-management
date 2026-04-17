import { PreviewDigitalTemplateFromMessagePlan } from '@molecules/PreviewDigitalTemplateFromMessagePlan/PreviewDigitalTemplateFromMessagePlan';
import { render, screen } from '@testing-library/react';
import {
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  ROUTING_CONFIG,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
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
        <PreviewDigitalTemplateFromMessagePlan
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
        <PreviewDigitalTemplateFromMessagePlan
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
        <PreviewDigitalTemplateFromMessagePlan
          initialState={SMS_TEMPLATE}
          previewComponent={PreviewTemplateDetailsSms}
          routingConfigId={ROUTING_CONFIG.id}
          lockNumber={5}
        />
      ),
  },
];

describe('PreviewDigitalTemplateFromMessagePlan', () => {
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
