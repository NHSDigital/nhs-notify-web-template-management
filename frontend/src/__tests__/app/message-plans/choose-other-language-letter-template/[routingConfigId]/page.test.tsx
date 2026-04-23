import ChooseOtherLanguageLetterTemplate, {
  generateMetadata,
} from '@app/message-plans/choose-other-language-letter-template/[routingConfigId]/page';
import { PDF_LETTER_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplates } from '@utils/form-actions';
import { getRoutingConfig } from '@utils/message-plans';
import { Language } from 'nhs-notify-web-template-management-types';

jest.mock('@utils/message-plans');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getRoutingConfigMock = jest.mocked(getRoutingConfig);
const getTemplatesMock = jest.mocked(getTemplates);

const FRENCH_LETTER_TEMPLATE = {
  ...PDF_LETTER_TEMPLATE,
  id: 'french-letter-id',
  name: 'French letter template',
  language: 'fr' as Language,
};

const POLISH_LETTER_TEMPLATE = {
  ...PDF_LETTER_TEMPLATE,
  id: 'polish-letter-id',
  name: 'Polish letter template',
  language: 'pl' as Language,
};

describe('ChooseOtherLanguageLetterTemplate page', () => {
  it('calls getTemplates with correct filters', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([
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
    expect(getTemplatesMock).toHaveBeenCalledWith({
      templateType: 'LETTER',
      letterType: 'x0',
      excludeLanguage: 'en',
      templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
      letterVersion: 'AUTHORING',
      campaignId: ROUTING_CONFIG.campaignId,
    });
  });

  it('renders foreign language letter template selection', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([
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
    expect(getTemplatesMock).toHaveBeenCalledWith({
      templateType: 'LETTER',
      letterType: 'x0',
      excludeLanguage: 'en',
      templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
      letterVersion: 'AUTHORING',
      campaignId: ROUTING_CONFIG.campaignId,
    });

    expect(await generateMetadata()).toEqual({
      title: 'Choose other language letter templates - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });
});
