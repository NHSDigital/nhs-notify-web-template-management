import { render } from '@testing-library/react';
import PreviewStandardEnglishLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-standard-english-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { SummaryPreviewLetter } from '@molecules/SummaryPreviewLetter/SummaryPreviewLetter';
import { validateLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@molecules/SummaryPreviewLetter/SummaryPreviewLetter');

const summaryPreviewLetterMock = jest.mocked(SummaryPreviewLetter);

describe('PreviewStandardEnglishLetterTemplateFromMessagePlan page', () => {
  it('should render SummaryPreviewLetter with validateLetterTemplate', async () => {
    summaryPreviewLetterMock.mockResolvedValueOnce(<div>mock</div>);

    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page =
      await PreviewStandardEnglishLetterTemplateFromMessagePlan(props);

    render(page);

    expect(summaryPreviewLetterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: props.params,
        searchParams: props.searchParams,
        validateTemplate: validateLetterTemplate,
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
