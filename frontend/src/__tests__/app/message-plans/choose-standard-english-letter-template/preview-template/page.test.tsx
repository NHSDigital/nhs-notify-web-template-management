/**
 * @jest-environment node
 */
import PreviewStandardEnglishLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-standard-english-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { SummaryChooseLetter } from '@molecules/SummaryChooseLetter/SummaryChooseLetter';
import { validateLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@molecules/SummaryChooseLetter/SummaryChooseLetter');

describe('PreviewStandardEnglishLetterTemplateFromMessagePlan page', () => {
  it('should render SummaryChooseLetter with validateLetterTemplate and redirectUrlOnLockNumberFailure', async () => {
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
      <SummaryChooseLetter
        {...props}
        validateTemplate={validateLetterTemplate}
        redirectUrlOnLockNumberFailure='/message-plans/edit-message-plan/routing-config-id'
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview letter template - NHS Notify',
    });
  });
});
