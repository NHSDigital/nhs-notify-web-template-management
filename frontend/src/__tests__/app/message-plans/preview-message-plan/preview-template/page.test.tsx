/**
 * @jest-environment node
 */
import PreviewLetterTemplateFromPreviewMessagePlan, {
  generateMetadata,
} from '@app/message-plans/preview-message-plan/[routingConfigId]/preview-template/[templateId]/page';
import { PreviewLetterFromMessagePlanPreview } from '@molecules/PreviewLetterFromMessagePlanPreview/PreviewLetterFromMessagePlanPreview';

jest.mock(
  '@molecules/PreviewLetterFromMessagePlanPreview/PreviewLetterFromMessagePlanPreview'
);

describe('PreviewLetterTemplateFromPreviewMessagePlan page', () => {
  it('should render PreviewLetterFromMessagePlanPreview with authoring letter validator', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
    };

    const page = await PreviewLetterTemplateFromPreviewMessagePlan(props);

    expect(page).toEqual(<PreviewLetterFromMessagePlanPreview {...props} />);
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview letter template - NHS Notify',
    });
  });
});
