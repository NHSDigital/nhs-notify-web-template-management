/**
 * @jest-environment node
 */
import PreviewLargePrintLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-large-print-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { PreviewLetterFromChooseLetter } from '@molecules/PreviewLetterFromChooseLetter/PreviewLetterFromChooseLetter';
import { validateLargePrintLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock(
  '@molecules/PreviewLetterFromChooseLetter/PreviewLetterFromChooseLetter'
);

describe('PreviewLargePrintLetterTemplateFromMessagePlan page', () => {
  it('should render PreviewLetterFromChooseLetter with validateLargePrintLetterTemplate and redirectUrlOnLockNumberFailure', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page = await PreviewLargePrintLetterTemplateFromMessagePlan(props);

    expect(page).toEqual(
      <PreviewLetterFromChooseLetter
        {...props}
        validateTemplate={validateLargePrintLetterTemplate}
        redirectUrlOnLockNumberFailure='/message-plans/edit-message-plan/routing-config-id'
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview large print letter template - NHS Notify',
    });
  });
});
