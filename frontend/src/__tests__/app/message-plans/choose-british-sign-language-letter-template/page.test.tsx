import ChooseBritishSignLanguageLetterTemplate, {
  generateMetadata,
} from '@app/message-plans/choose-british-sign-language-letter-template/[routingConfigId]/page';
import { BSL_LETTER_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplates } from '@utils/form-actions';
import { getRoutingConfig } from '@utils/message-plans';

jest.mock('@utils/message-plans');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getRoutingConfigMock = jest.mocked(getRoutingConfig);
const getTemplatesMock = jest.mocked(getTemplates);

describe('ChooseBritishSignLanguageLetterTemplate page', () => {
  it('calls getTemplates with correct filters', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([BSL_LETTER_TEMPLATE]);

    await ChooseBritishSignLanguageLetterTemplate({
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
      language: 'en',
      letterType: 'q4',
      templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
      letterVersion: 'AUTHORING',
      campaignId: ROUTING_CONFIG.campaignId,
    });
  });

  it('renders British Sign Language letter template selection', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([BSL_LETTER_TEMPLATE]);

    const page = await ChooseBritishSignLanguageLetterTemplate({
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
      language: 'en',
      letterType: 'q4',
      templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
      letterVersion: 'AUTHORING',
      campaignId: ROUTING_CONFIG.campaignId,
    });

    expect(await generateMetadata()).toEqual({
      title: 'Choose a British Sign Language letter template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders the empty version when there are no templates', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([]);

    const page = await ChooseBritishSignLanguageLetterTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    const container = render(page);

    expect(container.getByTestId('no-templates-message').textContent).toContain(
      'British Sign Language letter'
    );
    expect(container.asFragment()).toMatchSnapshot();
  });
});
