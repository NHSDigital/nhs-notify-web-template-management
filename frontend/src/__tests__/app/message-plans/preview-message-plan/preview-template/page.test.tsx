import { render } from '@testing-library/react';
import PreviewLetterTemplateFromPreviewMessagePlan, {
  generateMetadata,
} from '@app/message-plans/preview-message-plan/[routingConfigId]/preview-template/[templateId]/page';
import { SummaryPreviewLetter } from '@molecules/SummaryPreviewLetter/SummaryPreviewLetter';

jest.mock('@molecules/SummaryPreviewLetter/SummaryPreviewLetter');

const summaryPreviewLetterMock = jest.mocked(SummaryPreviewLetter);

describe('PreviewLetterTemplateFromPreviewMessagePlan page', () => {
  it('should render SummaryPreviewLetter with hideBackLinks and authoring validator', async () => {
    summaryPreviewLetterMock.mockResolvedValueOnce(<div>mock</div>);

    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page = await PreviewLetterTemplateFromPreviewMessagePlan(props);

    render(page);

    expect(summaryPreviewLetterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: props.params,
        searchParams: props.searchParams,
        validateTemplate: expect.any(Function),
        hideBackLinks: true,
      }),
      undefined
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview letter template - NHS Notify',
    });
  });
});
