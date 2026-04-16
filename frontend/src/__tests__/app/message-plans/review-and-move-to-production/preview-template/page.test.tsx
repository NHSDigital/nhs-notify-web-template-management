/**
 * @jest-environment node
 */
import PreviewLetterTemplateFromReviewAndMoveToProduction, {
  generateMetadata,
} from '@app/message-plans/review-and-move-to-production/[routingConfigId]/preview-template/[templateId]/page';
import { PreviewLetterFromMessagePlan } from '@molecules/PreviewLetterFromMessagePlan/PreviewLetterFromMessagePlan';

jest.mock(
  '@molecules/PreviewLetterFromMessagePlan/PreviewLetterFromMessagePlan'
);

describe('PreviewLetterTemplateFromReviewAndMoveToProduction page', () => {
  it('should render PreviewLetterFromMessagePlan with authoring letter validator', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
    };

    const page =
      await PreviewLetterTemplateFromReviewAndMoveToProduction(props);

    expect(page).toEqual(<PreviewLetterFromMessagePlan {...props} />);
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview letter template - NHS Notify',
    });
  });
});
