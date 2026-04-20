/**
 * @jest-environment node
 */
import PreviewLargePrintLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-large-print-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { PreviewLetterFromChooseTemplate } from '@molecules/PreviewLetterFromChooseTemplate/PreviewLetterFromChooseTemplate';
import { validateLargePrintLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock(
  '@molecules/PreviewLetterFromChooseTemplate/PreviewLetterFromChooseTemplate'
);

describe('PreviewLargePrintLetterTemplateFromMessagePlan page', () => {
  it('should render PreviewLetterFromChooseTemplate with validateLargePrintLetterTemplate', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page = await PreviewLargePrintLetterTemplateFromMessagePlan(props);

    expect(page).toEqual(
      <PreviewLetterFromChooseTemplate
        {...props}
        validateTemplate={validateLargePrintLetterTemplate}
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview large print letter template - NHS Notify',
    });
  });
});
