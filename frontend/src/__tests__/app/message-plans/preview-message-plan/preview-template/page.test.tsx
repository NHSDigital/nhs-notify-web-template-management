/**
 * @jest-environment node
 */
import PreviewLetterTemplateFromPreviewMessagePlan, {
  generateMetadata,
} from '@app/message-plans/preview-message-plan/[routingConfigId]/preview-template/[templateId]/page';
import { SummaryPreviewLetter } from '@molecules/SummaryPreviewLetter/SummaryPreviewLetter';
import { validateAuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@molecules/SummaryPreviewLetter/SummaryPreviewLetter');

describe('PreviewLetterTemplateFromPreviewMessagePlan page', () => {
  it('should render SummaryPreviewLetter with hideBackLinks and authoring letter validator', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
    };

    const page = await PreviewLetterTemplateFromPreviewMessagePlan(props);

    expect(page).toEqual(
      <SummaryPreviewLetter
        {...props}
        validateTemplate={validateAuthoringLetterTemplate}
        hideBackLinks
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview letter template - NHS Notify',
    });
  });
});
