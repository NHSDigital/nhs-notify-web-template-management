/**
 * @jest-environment node
 */
import PreviewStandardEnglishLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-standard-english-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { SummaryPreviewLetter } from '@molecules/SummaryPreviewLetter/SummaryPreviewLetter';
import { validateLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@molecules/SummaryPreviewLetter/SummaryPreviewLetter');

describe('PreviewStandardEnglishLetterTemplateFromMessagePlan page', () => {
  it('should render SummaryPreviewLetter with validateLetterTemplate and redirectUrl', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page =
      await PreviewStandardEnglishLetterTemplateFromMessagePlan(props);

    expect(page).toEqual(
      <SummaryPreviewLetter
        {...props}
        validateTemplate={validateLetterTemplate}
        redirectUrl='/message-plans/edit-message-plan/routing-config-id'
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview letter template - NHS Notify',
    });
  });
});
