import ChooseStandardEnglishLetterTemplate, {
  generateMetadata,
} from '@app/message-plans/choose-standard-english-letter-template/[routingConfigId]/page';
import {
  AUTHORING_LETTER_TEMPLATE,
  ROUTING_CONFIG,
} from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplates } from '@utils/form-actions';
import { getRoutingConfig } from '@utils/message-plans';

jest.mock('@utils/message-plans');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getRoutingConfigMock = jest.mocked(getRoutingConfig);
const getTemplatesMock = jest.mocked(getTemplates);

describe('ChooseStandardEnglishLetterTemplate page', () => {
  it('renders letter template selection', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([
      { ...AUTHORING_LETTER_TEMPLATE, templateStatus: 'PROOF_APPROVED' },
    ]);

    const page = await ChooseStandardEnglishLetterTemplate({
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
      letterType: 'x0',
      templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
      letterVersion: 'AUTHORING',
      campaignId: ROUTING_CONFIG.campaignId,
    });

    expect(await generateMetadata()).toEqual({
      title: 'Choose a standard English letter template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders the empty state message when there are no templates', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);
    getTemplatesMock.mockResolvedValueOnce([]);

    const page = await ChooseStandardEnglishLetterTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    const container = render(page);

    expect(container.getByTestId('no-templates-message').textContent).toBe(
      'You do not have any standard English letter templates linked to the campaign you chose for this message plan.'
    );
    expect(container.asFragment()).toMatchSnapshot();
  });
});
