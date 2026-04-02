/**
 * @jest-environment node
 */
import PreviewLargePrintLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-large-print-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { SummaryPreviewLetter } from '@molecules/SummaryPreviewLetter/SummaryPreviewLetter';
import { validateLargePrintLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@molecules/SummaryPreviewLetter/SummaryPreviewLetter');

describe('PreviewLargePrintLetterTemplateFromMessagePlan page', () => {
  it('should render SummaryPreviewLetter with validateLargePrintLetterTemplate and redirectUrl', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page = await PreviewLargePrintLetterTemplateFromMessagePlan(props);

    expect(page).toEqual(
      <SummaryPreviewLetter
        {...props}
        validateTemplate={validateLargePrintLetterTemplate}
        redirectUrl='/message-plans/edit-message-plan/routing-config-id'
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview large print letter template - NHS Notify',
    });
  });
});
