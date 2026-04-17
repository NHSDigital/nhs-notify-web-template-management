/**
 * @jest-environment node
 */
import PreviewNhsAppTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-nhs-app-template/[routingConfigId]/preview-template/[templateId]/page';
import { PreviewDigitalTemplateFromChooseTemplate } from '@molecules/PreviewDigitalTemplateFromChooseTemplate/PreviewDigitalTemplateFromChooseTemplate';
import PreviewTemplateDetailsNhsApp from '@molecules/PreviewTemplateDetails/PreviewTemplateDetailsNhsApp';
import { validateNHSAppTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock(
  '@molecules/PreviewDigitalTemplateFromChooseTemplate/PreviewDigitalTemplateFromChooseTemplate'
);

describe('PreviewNhsAppTemplateFromMessagePlan page', () => {
  it('should render PreviewDigitalTemplateFromChooseTemplate with validateNHSAppTemplate and PreviewTemplateDetailsNhsApp', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page = await PreviewNhsAppTemplateFromMessagePlan(props);

    expect(page).toEqual(
      <PreviewDigitalTemplateFromChooseTemplate
        {...props}
        validateTemplate={validateNHSAppTemplate}
        DetailComponent={PreviewTemplateDetailsNhsApp}
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview NHS App message template - NHS Notify',
    });
  });
});
