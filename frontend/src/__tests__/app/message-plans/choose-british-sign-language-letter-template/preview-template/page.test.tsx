/**
 * @jest-environment node
 */
import PreviewBritishSignLanguageLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-british-sign-language-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { PreviewLetterFromChooseTemplate } from '@molecules/PreviewLetterFromChooseTemplate/PreviewLetterFromChooseTemplate';
import { validateBritishSignLanguageLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock(
  '@molecules/PreviewLetterFromChooseTemplate/PreviewLetterFromChooseTemplate'
);

describe('PreviewBritishSignLanguageLetterTemplateFromMessagePlan page', () => {
  it('should render PreviewLetterFromChooseTemplate with validateBritishSignLanguageLetterTemplate', async () => {
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
      <PreviewLetterFromChooseTemplate
        {...props}
        validateTemplate={validateBritishSignLanguageLetterTemplate}
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview British Sign Language letter template - NHS Notify',
    });
  });
});
