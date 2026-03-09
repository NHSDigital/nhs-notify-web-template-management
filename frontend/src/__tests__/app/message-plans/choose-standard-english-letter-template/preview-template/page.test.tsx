import PreviewStandardEnglishLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-standard-english-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { PDF_LETTER_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('PreviewStandardEnglishLetterTemplateFromMessagePlan page', () => {
  it('should redirect to the edit message plan page when lockNumber is invalid', async () => {
    await PreviewStandardEnglishLetterTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({
        lockNumber: 'invalid',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/edit-message-plan/routing-config-id',
      'replace'
    );
  });

  it('should redirect to the edit message plan page when lockNumber is missing', async () => {
    await PreviewStandardEnglishLetterTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({}),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/edit-message-plan/routing-config-id',
      'replace'
    );
  });

  it('should redirect to invalid page with invalid template id', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await PreviewStandardEnglishLetterTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'invalid-template-id',
      }),
      searchParams: Promise.resolve({
        lockNumber: '0',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('invalid-template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('renders letter template preview', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...PDF_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await PreviewStandardEnglishLetterTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: PDF_LETTER_TEMPLATE.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '5',
      }),
    });

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(PDF_LETTER_TEMPLATE.id);

    expect(await generateMetadata()).toEqual({
      title: 'Preview letter template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });
});
