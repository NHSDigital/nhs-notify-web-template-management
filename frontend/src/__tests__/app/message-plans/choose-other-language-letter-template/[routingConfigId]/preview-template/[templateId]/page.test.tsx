import PreviewOtherLanguageLetterTemplateFromMessagePlan, {
  generateMetadata,
} from '@app/message-plans/choose-other-language-letter-template/[routingConfigId]/preview-template/[templateId]/page';
import { PDF_LETTER_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { Language } from 'nhs-notify-backend-client';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const FRENCH_LETTER_TEMPLATE = {
  ...PDF_LETTER_TEMPLATE,
  id: 'french-letter-id',
  name: 'French letter template',
  language: 'fr' as Language,
};

describe('PreviewOtherLanguageLetterTemplateFromMessagePlan page', () => {
  it('should redirect to choose-templates when lockNumber is invalid', async () => {
    await PreviewOtherLanguageLetterTemplateFromMessagePlan({
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
    await PreviewOtherLanguageLetterTemplateFromMessagePlan({
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

  it('should redirect to invalid page with invalid template id', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await PreviewOtherLanguageLetterTemplateFromMessagePlan({
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

  it('renders foreign language letter template preview', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...FRENCH_LETTER_TEMPLATE,
      templateStatus: 'SUBMITTED',
    });

    const page = await PreviewOtherLanguageLetterTemplateFromMessagePlan({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
        templateId: FRENCH_LETTER_TEMPLATE.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '5',
      }),
    });

    const container = render(page);

    expect(getTemplateMock).toHaveBeenCalledWith(FRENCH_LETTER_TEMPLATE.id);

    expect(await generateMetadata()).toEqual({
      title: 'Preview other language letter template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });
});
