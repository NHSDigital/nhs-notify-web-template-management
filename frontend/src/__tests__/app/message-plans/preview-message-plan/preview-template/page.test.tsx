/**
 * @jest-environment node
 */
import PreviewLetterTemplateFromPreviewMessagePlan, {
  generateMetadata,
} from '@app/message-plans/preview-message-plan/[routingConfigId]/preview-template/[templateId]/page';
import { SummaryLetterFromMessagePlan } from '@molecules/SummaryLetterFromMessagePlan/SummaryLetterFromMessagePlan';
import { validateAuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock(
  '@molecules/SummaryLetterFromMessagePlan/SummaryLetterFromMessagePlan'
);

describe('PreviewLetterTemplateFromPreviewMessagePlan page', () => {
  it('should render SummaryLetterFromMessagePlan with authoring letter validator', async () => {
    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
    };

    const page = await PreviewLetterTemplateFromPreviewMessagePlan(props);

    expect(page).toEqual(
      <SummaryLetterFromMessagePlan
        {...props}
        validateTemplate={validateAuthoringLetterTemplate}
      />
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview letter template - NHS Notify',
    });
  });
});
