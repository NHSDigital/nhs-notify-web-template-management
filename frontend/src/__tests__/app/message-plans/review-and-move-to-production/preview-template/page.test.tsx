/**
 * @jest-environment node
 */
import PreviewLetterTemplateFromReviewAndMoveToProduction, {
  generateMetadata,
} from '@app/message-plans/review-and-move-to-production/[routingConfigId]/preview-template/[templateId]/page';
import { PreviewLetterFromMessagePlanPreview } from '@molecules/PreviewLetterFromMessagePlanPreview/PreviewLetterFromMessagePlanPreview';

jest.mock(
  '@molecules/PreviewLetterFromMessagePlanPreview/PreviewLetterFromMessagePlanPreview'
);

describe('PreviewLetterTemplateFromReviewAndMoveToProduction page', () => {
  it('should render PreviewLetterFromMessagePlanPreview with authoring letter validator', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
    };

    const page =
      await PreviewLetterTemplateFromReviewAndMoveToProduction(props);

    expect(page).toEqual(<PreviewLetterFromMessagePlanPreview {...props} />);
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview letter template - NHS Notify',
    });
  });
});
