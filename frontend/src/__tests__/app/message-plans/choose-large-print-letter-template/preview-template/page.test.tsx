import PreviewLargePrintLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-large-print-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import {
  LARGE_PRINT_LETTER_TEMPLATE,
  ROUTING_CONFIG,
} from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('PreviewLargePrintLetterTemplateFromMessagePlan page', () => {
  it('should redirect to choose-templates when lockNumber is invalid', async () => {
    await PreviewLargePrintLetterTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({
        lockNumber: 'invalid',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/choose-templates/routing-config-id',
      'replace'
    );
  });

  it('should redirect to choose-templates when lockNumber is missing', async () => {
    await PreviewLargePrintLetterTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: 'routing-config-id',
        templateId: 'template-id',
      }),
      searchParams: Promise.resolve({}),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/choose-templates/routing-config-id',
      'replace'
    );
  });

  it('should redirect to invalid page for invalid template id', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await PreviewLargePrintLetterTemplateFromMessagePlan({
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

  it('renders large print letter template preview', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...LARGE_PRINT_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await PreviewLargePrintLetterTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: LARGE_PRINT_LETTER_TEMPLATE.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '5',
      }),
    });

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(
      LARGE_PRINT_LETTER_TEMPLATE.id
    );

    expect(await generateMetadata()).toEqual({
      title: 'Preview large print letter template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });
});
