import { PropsWithChildren } from 'react';
import { renderHook } from '@testing-library/react';
import {
  ClientConfigProvider,
  useCampaignIds,
  useClientConfig,
  useFeatureFlags,
} from '@providers/client-config-provider';
import { ClientConfiguration } from 'nhs-notify-web-template-management-types';
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
    campaignIds: ['campaign-1', 'campaign-2'],
    features: { proofing: true, routing: false },
  };

  const { result } = renderHook(useClientConfig, {
    wrapper: renderProvider(config),
  });

  expect(result.current).toEqual(config);
});

describe('useCampaignIds', () => {
  it('returns a sorted list of all campaign ids', () => {
    const config: ClientConfiguration = {
      campaignIds: ['c', 'a'],
      features: {},
    };

    const { result } = renderHook(useCampaignIds, {
      wrapper: renderProvider(config),
    });

    expect(result.current).toEqual(['a', 'c']);
  });

  it('returns an empty list of campaign ids if present', () => {
    const config: ClientConfiguration = {
      campaignIds: [],
      features: {},
    };

    const { result } = renderHook(useCampaignIds, {
      wrapper: renderProvider(config),
    });

    expect(result.current).toEqual([]);
  });

  it('returns an empty list of campaign ids if not present', () => {
    const config: ClientConfiguration = {
      features: {},
    };

    const { result } = renderHook(useCampaignIds, {
      wrapper: renderProvider(config),
    });

    expect(result.current).toEqual([]);
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
