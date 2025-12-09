import ChooseOtherLanguageLetterTemplate, {
  generateMetadata,
} from '@app/message-plans/choose-other-language-letter-template/[routingConfigId]/page';
import { LETTER_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getForeignLanguageLetterTemplates } from '@utils/form-actions';
import { getRoutingConfig } from '@utils/message-plans';
import { redirect } from 'next/navigation';
import { Language } from 'nhs-notify-backend-client';

jest.mock('@utils/message-plans');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getRoutingConfigMock = jest.mocked(getRoutingConfig);
const getForeignLanguageLetterTemplatesMock = jest.mocked(
  getForeignLanguageLetterTemplates
);
const redirectMock = jest.mocked(redirect);

const FRENCH_LETTER_TEMPLATE = {
  ...LETTER_TEMPLATE,
  id: 'french-letter-id',
  name: 'French letter template',
  language: 'fr' as Language,
};

const POLISH_LETTER_TEMPLATE = {
  ...LETTER_TEMPLATE,
  id: 'polish-letter-id',
  name: 'Polish letter template',
  language: 'pl' as Language,
};

describe('ChooseOtherLanguageLetterTemplate page', () => {
  it('should redirect to invalid page for invalid routing config id', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(undefined);
    getForeignLanguageLetterTemplatesMock.mockResolvedValueOnce([
      FRENCH_LETTER_TEMPLATE,
      POLISH_LETTER_TEMPLATE,
    ]);

    await ChooseOtherLanguageLetterTemplate({
      params: Promise.resolve({
        routingConfigId: 'invalid-id',
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith('invalid-id');
    expect(getForeignLanguageLetterTemplatesMock).toHaveBeenCalled();

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

  it('should redirect to invalid page if plan has no letter cascade entry', async () => {
    getRoutingConfigMock.mockResolvedValueOnce({
      ...ROUTING_CONFIG,
      cascade: ROUTING_CONFIG.cascade.filter(
        (item) => item.channel !== 'LETTER'
      ),
    });
    getForeignLanguageLetterTemplatesMock.mockResolvedValueOnce([
      FRENCH_LETTER_TEMPLATE,
      POLISH_LETTER_TEMPLATE,
    ]);

    await ChooseOtherLanguageLetterTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith(ROUTING_CONFIG.id);

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

  it('fetches routing config and templates in parallel', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getForeignLanguageLetterTemplatesMock.mockResolvedValueOnce([
      FRENCH_LETTER_TEMPLATE,
      POLISH_LETTER_TEMPLATE,
    ]);

    await ChooseOtherLanguageLetterTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith(ROUTING_CONFIG.id);
    expect(getForeignLanguageLetterTemplatesMock).toHaveBeenCalled();
  });

  it('renders foreign language letter template selection', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getForeignLanguageLetterTemplatesMock.mockResolvedValueOnce([
      FRENCH_LETTER_TEMPLATE,
      POLISH_LETTER_TEMPLATE,
    ]);

    const page = await ChooseOtherLanguageLetterTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    const container = render(page);

    expect(getRoutingConfigMock).toHaveBeenCalledWith(ROUTING_CONFIG.id);
    expect(getForeignLanguageLetterTemplatesMock).toHaveBeenCalled();

    expect(await generateMetadata()).toEqual({
      title: 'Choose other language letter templates - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('redirects to choose templates page if the lockNumber is missing', async () => {
    await ChooseOtherLanguageLetterTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/message-plans/choose-templates/${ROUTING_CONFIG.id}`,
      'replace'
    );
  });
});
