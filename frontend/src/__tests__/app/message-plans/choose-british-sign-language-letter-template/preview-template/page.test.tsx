/**
 * @jest-environment node
 */
import PreviewBritishSignLanguageLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-british-sign-language-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { SummaryPreviewLetter } from '@molecules/SummaryPreviewLetter/SummaryPreviewLetter';
import { validateBritishSignLanguageLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@molecules/SummaryPreviewLetter/SummaryPreviewLetter');

describe('PreviewBritishSignLanguageLetterTemplateFromMessagePlan page', () => {
  it('should render SummaryPreviewLetter with validateBritishSignLanguageLetterTemplate and redirectUrl', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page =
      await PreviewBritishSignLanguageLetterTemplateFromMessagePlan(props);

    expect(page).toEqual(
      <SummaryPreviewLetter
        {...props}
        validateTemplate={validateBritishSignLanguageLetterTemplate}
        redirectUrl='/message-plans/edit-message-plan/routing-config-id'
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview British Sign Language letter template - NHS Notify',
    });
  });
});
