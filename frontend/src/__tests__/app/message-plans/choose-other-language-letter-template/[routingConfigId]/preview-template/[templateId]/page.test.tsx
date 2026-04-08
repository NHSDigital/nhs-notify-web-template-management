/**
 * @jest-environment node
 */
import PreviewOtherLanguageLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-other-language-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { SummaryChooseLetter } from '@molecules/SummaryChooseLetter/SummaryChooseLetter';
import { validateForeignLanguageLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@molecules/SummaryChooseLetter/SummaryChooseLetter');

describe('PreviewOtherLanguageLetterTemplateFromMessagePlan page', () => {
  it('should render SummaryChooseLetter with validateForeignLanguageLetterTemplate and redirectUrlOnLockNumberFailure', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page = await PreviewOtherLanguageLetterTemplateFromMessagePlan(props);

    expect(page).toEqual(
      <SummaryChooseLetter
        {...props}
        validateTemplate={validateForeignLanguageLetterTemplate}
        redirectUrlOnLockNumberFailure='/message-plans/edit-message-plan/routing-config-id'
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview other language letter template - NHS Notify',
    });
  });
});
