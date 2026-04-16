/**
 * @jest-environment node
 */
import PreviewBritishSignLanguageLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-british-sign-language-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { PreviewLetterFromChooseLetter } from '@molecules/PreviewLetterFromChooseLetter/PreviewLetterFromChooseLetter';
import { validateBritishSignLanguageLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock(
  '@molecules/PreviewLetterFromChooseLetter/PreviewLetterFromChooseLetter'
);

describe('PreviewBritishSignLanguageLetterTemplateFromMessagePlan page', () => {
  it('should render PreviewLetterFromChooseLetter with validateBritishSignLanguageLetterTemplate and redirectUrlOnLockNumberFailure', async () => {
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
      <PreviewLetterFromChooseLetter
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
