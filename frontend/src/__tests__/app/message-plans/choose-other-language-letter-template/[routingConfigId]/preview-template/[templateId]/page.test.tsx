import { render } from '@testing-library/react';
import PreviewOtherLanguageLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-other-language-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { SummaryPreviewLetter } from '@molecules/SummaryPreviewLetter/SummaryPreviewLetter';
import { validateForeignLanguageLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@molecules/SummaryPreviewLetter/SummaryPreviewLetter');

const summaryPreviewLetterMock = jest.mocked(SummaryPreviewLetter);

describe('PreviewOtherLanguageLetterTemplateFromMessagePlan page', () => {
  it('should render SummaryPreviewLetter with validateForeignLanguageLetterTemplate', async () => {
    summaryPreviewLetterMock.mockResolvedValueOnce(<div>mock</div>);

    const props = {
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({ lockNumber: '5' }),
    };

    const page = await PreviewOtherLanguageLetterTemplateFromMessagePlan(props);

    render(page);

    expect(summaryPreviewLetterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: props.params,
        searchParams: props.searchParams,
        validateTemplate: validateForeignLanguageLetterTemplate,
      }),
      undefined
    );
  });

  it('should have the correct page title', async () => {
    expect(await generateMetadata()).toEqual({
      title: 'Preview other language letter template - NHS Notify',
    });
  });
});
