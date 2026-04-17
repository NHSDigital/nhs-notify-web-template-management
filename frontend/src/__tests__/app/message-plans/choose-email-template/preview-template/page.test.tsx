/**
 * @jest-environment node
 */
import PreviewEmailTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-email-template/[routingConfigId]/preview-template/[templateId]/page';
import { PreviewDigitalTemplateFromChooseTemplate } from '@molecules/PreviewDigitalTemplateFromChooseTemplate/PreviewDigitalTemplateFromChooseTemplate';
import PreviewTemplateDetailsEmail from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsEmail';
import { validateEmailTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock(
  '@molecules/PreviewDigitalTemplateFromChooseTemplate/PreviewDigitalTemplateFromChooseTemplate'
);

describe('PreviewEmailTemplateFromMessagePlan page', () => {
  it('should render PreviewDigitalTemplateFromChooseTemplate with validateEmailTemplate and PreviewTemplateDetailsEmail', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page = await PreviewEmailTemplateFromMessagePlan(props);

    expect(page).toEqual(
      <PreviewDigitalTemplateFromChooseTemplate
        {...props}
        validateTemplate={validateEmailTemplate}
        DetailComponent={PreviewTemplateDetailsEmail}
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview email template - NHS Notify',
    });
  });
});
