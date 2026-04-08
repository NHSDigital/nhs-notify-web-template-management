import ChooseBritishSignLanguageLetterTemplate, {
  generateMetadata,
} from '@app/message-plans/choose-british-sign-language-letter-template/[routingConfigId]/page';
import { BSL_LETTER_TEMPLATE, ROUTING_CONFIG } from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getTemplates } from '@utils/form-actions';
import { getRoutingConfig } from '@utils/message-plans';
import { redirect } from 'next/navigation';

jest.mock('@utils/message-plans');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getRoutingConfigMock = jest.mocked(getRoutingConfig);
const getTemplatesMock = jest.mocked(getTemplates);
const redirectMock = jest.mocked(redirect);

describe('ChooseBritishSignLanguageLetterTemplate page', () => {
  it('should redirect to invalid page for invalid routing config id', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(undefined);
    getTemplatesMock.mockResolvedValueOnce([BSL_LETTER_TEMPLATE]);

    await ChooseBritishSignLanguageLetterTemplate({
      params: Promise.resolve({
        routingConfigId: 'invalid-id',
      }),
      searchParams: Promise.resolve({
        lockNumber: '42',
      }),
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith('invalid-id');
    expect(getTemplatesMock).toHaveBeenCalledWith({
      templateType: 'LETTER',
      language: 'en',
      letterType: 'q4',
      templateStatus: ['SUBMITTED', 'PROOF_APPROVED'],
      letterVersion: 'AUTHORING',
    });

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

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

  it('fetches routing config and templates in parallel', async () => {
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
    });

    expect(await generateMetadata()).toEqual({
      title: 'Choose a British Sign Language letter template - NHS Notify',
    });
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('redirects to the edit message plan page if the lockNumber is missing', async () => {
    await ChooseBritishSignLanguageLetterTemplate({
      params: Promise.resolve({
        routingConfigId: ROUTING_CONFIG.id,
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/message-plans/edit-message-plan/${ROUTING_CONFIG.id}`,
      'replace'
    );
  });
});
