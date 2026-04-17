/**
 * @jest-environment node
 */
import PreviewTextMessageTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-text-message-template/[routingConfigId]/preview-template/[templateId]/page';
import { PreviewDigitalTemplateFromChooseTemplate } from '@molecules/PreviewDigitalTemplateFromChooseTemplate/PreviewDigitalTemplateFromChooseTemplate';
import PreviewTemplateDetailsSms from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsSms';
import { validateSMSTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock(
  '@molecules/PreviewDigitalTemplateFromChooseTemplate/PreviewDigitalTemplateFromChooseTemplate'
);

describe('PreviewTextMessageTemplateFromMessagePlan page', () => {
  it('should render PreviewDigitalTemplateFromChooseTemplate with validateSMSTemplate and PreviewTemplateDetailsSms', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page = await PreviewTextMessageTemplateFromMessagePlan(props);

    expect(page).toEqual(
      <PreviewDigitalTemplateFromChooseTemplate
        {...props}
        validateTemplate={validateSMSTemplate}
        DetailComponent={PreviewTemplateDetailsSms}
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview text message template - NHS Notify',
    });
  });
});
