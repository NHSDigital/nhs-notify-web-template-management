import { ChooseTemplateFromMessagePlan } from '@molecules/ChooseTemplateFromMessagePlan/ChooseTemplateFromMessagePlan';
import {
  EMAIL_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  ROUTING_CONFIG,
} from '@testhelpers/helpers';
import { render } from '@testing-library/react';
import { getRoutingConfig } from '@utils/message-plans';
import { redirect } from 'next/navigation';
import { Language } from 'nhs-notify-web-template-management-types';
import type { LetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@utils/message-plans');
jest.mock('next/navigation');

const getRoutingConfigMock = jest.mocked(getRoutingConfig);
const redirectMock = jest.mocked(redirect);

const channelTemplateListFetcher = jest
  .fn()
  .mockResolvedValue([EMAIL_TEMPLATE]);

const FRENCH_LETTER_TEMPLATE: LetterTemplate = {
  ...PDF_LETTER_TEMPLATE,
  id: 'french-letter-id',
  name: 'French letter template',
  language: 'fr' as Language,
};

const languageTemplateListFetcher = jest
  .fn()
  .mockResolvedValue([FRENCH_LETTER_TEMPLATE]);

describe('ChooseTemplateFromMessagePlan - channel variant', () => {
  const defaultProps = {
    variant: 'single' as const,
    channel: 'EMAIL' as const,
    templateListFetcher: channelTemplateListFetcher,
    pageHeading: 'Choose an email template',
    noTemplatesText: 'No templates available.',
    hintText: 'Select one template.',
  };

  it('redirects to edit-message-plan if lockNumber is missing', async () => {
    await ChooseTemplateFromMessagePlan({
      props: {
        params: Promise.resolve({ routingConfigId: ROUTING_CONFIG.id }),
      },
      ...defaultProps,
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/message-plans/edit-message-plan/${ROUTING_CONFIG.id}`,
      'replace'
    );
  });

  it('redirects to /message-plans/invalid for an invalid routingConfigId', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(undefined);

    await ChooseTemplateFromMessagePlan({
      props: {
        params: Promise.resolve({ routingConfigId: 'invalid-id' }),
        searchParams: Promise.resolve({ lockNumber: '42' }),
      },
      ...defaultProps,
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith('invalid-id');
    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

  it('redirects to /message-plans/invalid if the cascade has no matching channel', async () => {
    getRoutingConfigMock.mockResolvedValueOnce({
      ...ROUTING_CONFIG,
      cascade: ROUTING_CONFIG.cascade.filter(
        (item) => item.channel !== 'EMAIL'
      ),
    });

    await ChooseTemplateFromMessagePlan({
      props: {
        params: Promise.resolve({ routingConfigId: ROUTING_CONFIG.id }),
        searchParams: Promise.resolve({ lockNumber: '42' }),
      },
      ...defaultProps,
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

  it('calls templateListFetcher with campaignId and renders', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);

    const page = await ChooseTemplateFromMessagePlan({
      props: {
        params: Promise.resolve({ routingConfigId: ROUTING_CONFIG.id }),
        searchParams: Promise.resolve({ lockNumber: '42' }),
      },
      ...defaultProps,
    });

    const container = render(page);

    expect(channelTemplateListFetcher).toHaveBeenCalledWith(
      ROUTING_CONFIG.campaignId
    );
    expect(container.asFragment()).toMatchSnapshot();
  });
});

describe('ChooseTemplateFromMessagePlan - language variant', () => {
  const defaultProps = {
    variant: 'language' as const,
    channel: 'LETTER' as const,
    templateListFetcher: languageTemplateListFetcher,
    pageHeading: 'Choose other language letter templates',
  };

  it('redirects to edit-message-plan if lockNumber is missing', async () => {
    await ChooseTemplateFromMessagePlan({
      props: {
        params: Promise.resolve({ routingConfigId: ROUTING_CONFIG.id }),
      },
      ...defaultProps,
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/message-plans/edit-message-plan/${ROUTING_CONFIG.id}`,
      'replace'
    );
  });

  it('redirects to /message-plans/invalid for an invalid routingConfigId', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(undefined);

    await ChooseTemplateFromMessagePlan({
      props: {
        params: Promise.resolve({ routingConfigId: 'invalid-id' }),
        searchParams: Promise.resolve({ lockNumber: '42' }),
      },
      ...defaultProps,
    });

    expect(getRoutingConfigMock).toHaveBeenCalledWith('invalid-id');
    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

  it('redirects to /message-plans/invalid if the cascade has no LETTER entry', async () => {
    getRoutingConfigMock.mockResolvedValueOnce({
      ...ROUTING_CONFIG,
      cascade: ROUTING_CONFIG.cascade.filter(
        (item) => item.channel !== 'LETTER'
      ),
    });

    await ChooseTemplateFromMessagePlan({
      props: {
        params: Promise.resolve({ routingConfigId: ROUTING_CONFIG.id }),
        searchParams: Promise.resolve({ lockNumber: '42' }),
      },
      ...defaultProps,
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/message-plans/invalid',
      'replace'
    );
  });

  it('calls templateListFetcher with campaignId and renders', async () => {
    getRoutingConfigMock.mockResolvedValueOnce(ROUTING_CONFIG);

    const page = await ChooseTemplateFromMessagePlan({
      props: {
        params: Promise.resolve({ routingConfigId: ROUTING_CONFIG.id }),
        searchParams: Promise.resolve({ lockNumber: '42' }),
      },
      ...defaultProps,
    });

    const container = render(page);

    expect(languageTemplateListFetcher).toHaveBeenCalledWith(
      ROUTING_CONFIG.campaignId
    );
    expect(container.asFragment()).toMatchSnapshot();
  });
});
