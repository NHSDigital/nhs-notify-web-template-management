import PreviewBritishSignLanguageLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-british-sign-language-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { BSL_LETTER_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('PreviewBritishSignLanguageLetterTemplateFromMessagePlan page', () => {
  it('should redirect to the edit message plan page when lockNumber is invalid', async () => {
    await PreviewBritishSignLanguageLetterTemplateFromMessagePlan({
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
    await PreviewBritishSignLanguageLetterTemplateFromMessagePlan({
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

  it('should redirect to invalid page for invalid template id', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await PreviewBritishSignLanguageLetterTemplateFromMessagePlan({
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

  it('renders British Sign Language letter template preview', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...BSL_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await PreviewBritishSignLanguageLetterTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: BSL_LETTER_TEMPLATE.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '5',
      }),
    });

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(BSL_LETTER_TEMPLATE.id);

    expect(await generateMetadata()).toEqual({
      title: 'Preview British Sign Language letter template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });
});
