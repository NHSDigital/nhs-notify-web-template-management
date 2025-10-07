import { PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react';
import {
  ClientConfigProvider,
  useCampaignIds,
  useClientConfig,
} from '@providers/client-config-provider';
import { ClientConfiguration } from 'nhs-notify-backend-client';

const renderProvider =
  (config: ClientConfiguration) =>
  ({ children }: PropsWithChildren) => {
    return (
      <ClientConfigProvider config={config}>{children}</ClientConfigProvider>
    );
  };

it('returns client config from context', () => {
  const config: ClientConfiguration = {
    campaignId: 'campaign-0',
    campaignIds: ['campaign-1', 'campaign-2'],
    features: { proofing: true, routing: false },
  };

  const { result } = renderHook(useClientConfig, {
    wrapper: renderProvider(config),
  });

  expect(result.current).toEqual(config);
});

describe('useCampaignIds', () => {
  it('returns a list of all campaign ids (including legacy)', () => {
    const config: ClientConfiguration = {
      campaignId: 'b',
      campaignIds: ['a', 'c'],
      features: {},
    };

    const { result } = renderHook(useCampaignIds, {
      wrapper: renderProvider(config),
    });

    expect(result.current).toEqual(['a', 'b', 'c']);
  });

  it('returns a list of all campaign ids (no legacy)', () => {
    const config: ClientConfiguration = {
      campaignIds: ['z', 'm', 'a', 'f'],
      features: {},
    };

    const { result } = renderHook(useCampaignIds, {
      wrapper: renderProvider(config),
    });

    expect(result.current).toEqual(['a', 'f', 'm', 'z']);
  });

  it('returns a list of campaign ids (only legacy)', () => {
    const config: ClientConfiguration = {
      campaignId: 'campaign-0',
      features: {},
    };

    const { result } = renderHook(useCampaignIds, {
      wrapper: renderProvider(config),
    });

    expect(result.current).toEqual(['campaign-0']);
  });

  it('removes duplicates', () => {
    const config: ClientConfiguration = {
      campaignId: 'campaign-q',
      campaignIds: ['campaign-z', 'campaign-q', 'campaign-z'],
      features: {},
    };

    const { result } = renderHook(useCampaignIds, {
      wrapper: renderProvider(config),
    });

    expect(result.current).toEqual(['campaign-q', 'campaign-z']);
  });
});
