/**
 * @jest-environment node
 */
import PreviewBritishSignLanguageLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-british-sign-language-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { SummaryChooseLetter } from '@molecules/SummaryChooseLetter/SummaryChooseLetter';
import { validateBritishSignLanguageLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@molecules/SummaryChooseLetter/SummaryChooseLetter');

describe('PreviewBritishSignLanguageLetterTemplateFromMessagePlan page', () => {
  it('should render SummaryChooseLetter with validateBritishSignLanguageLetterTemplate and redirectUrlOnLockNumberFailure', async () => {
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
      <SummaryChooseLetter
        {...props}
        validateTemplate={validateBritishSignLanguageLetterTemplate}
        redirectUrlOnLockNumberFailure='/message-plans/edit-message-plan/routing-config-id'
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview British Sign Language letter template - NHS Notify',
    });
  });
});
