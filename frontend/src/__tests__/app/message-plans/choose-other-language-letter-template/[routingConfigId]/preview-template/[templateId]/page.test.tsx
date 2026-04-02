/**
 * @jest-environment node
 */
import PreviewOtherLanguageLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-other-language-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { SummaryPreviewLetter } from '@molecules/SummaryPreviewLetter/SummaryPreviewLetter';
import { validateForeignLanguageLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@molecules/SummaryPreviewLetter/SummaryPreviewLetter');

describe('PreviewOtherLanguageLetterTemplateFromMessagePlan page', () => {
  it('should render SummaryPreviewLetter with validateForeignLanguageLetterTemplate and redirectUrl', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page =
      await PreviewOtherLanguageLetterTemplateFromMessagePlan(props);

    expect(page).toEqual(
      <SummaryPreviewLetter
        {...props}
        validateTemplate={validateForeignLanguageLetterTemplate}
        redirectUrl='/message-plans/edit-message-plan/routing-config-id'
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview other language letter template - NHS Notify',
    });
  });
});
