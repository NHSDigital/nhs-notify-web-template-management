import { PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react';
import {
  ClientConfigProvider,
  useCampaignIds,
  useClientConfig,
  useFeatureFlags,
} from '@providers/client-config-provider';
import { ClientConfiguration } from 'nhs-notify-backend-client';
import { initialFeatureFlags } from '@utils/client-config';

const renderProvider =
  (config: ClientConfiguration | null) =>
  ({ children }: PropsWithChildren) => {
    return (
      <ClientConfigProvider value={config}>{children}</ClientConfigProvider>
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
  it('returns a sorted list of all campaign ids (ignores deprecated)', () => {
    const config: ClientConfiguration = {
      campaignId: 'b',
      campaignIds: ['c', 'a'],
      features: {},
    };

    const { result } = renderHook(useCampaignIds, {
      wrapper: renderProvider(config),
    });

    expect(result.current).toEqual(['a', 'c']);
  });

  it('returns a empty list of all campaign ids if present (ignores deprecated)', () => {
    const config: ClientConfiguration = {
      campaignId: 'b',
      campaignIds: [],
      features: {},
    };

    const { result } = renderHook(useCampaignIds, {
      wrapper: renderProvider(config),
    });

    expect(result.current).toEqual([]);
  });

  it('returns a list of campaign ids (only legacy present)', () => {
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
      campaignIds: ['campaign-z', 'campaign-q', 'campaign-z'],
      features: {},
    };

    const { result } = renderHook(useCampaignIds, {
      wrapper: renderProvider(config),
    });

    expect(result.current).toEqual(['campaign-q', 'campaign-z']);
  });
});

describe('useFeatureFlags', () => {
  it('returns default feature flags when there is no config', () => {
    const { result } = renderHook(useFeatureFlags, {
      wrapper: renderProvider(null),
    });

    expect(result.current).toEqual(initialFeatureFlags);
  });

  it('returns feature flags from context', () => {
    const config: ClientConfiguration = {
      features: {
        routing: true,
        proofing: true,
      },
    };

    const { result } = renderHook(useFeatureFlags, {
      wrapper: renderProvider(config),
    });

    expect(result.current).toEqual(config.features);
  });
});
