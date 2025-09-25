import { GET as getFeatures } from '@app/internal/features/route';
import { getSessionServer } from '@utils/amplify-utils';
import { fetchClient } from '@utils/server-features';
import { FEATURES, initialFeatureFlags } from '@utils/features';
import { NextRequest, NextResponse } from 'next/server';
import { ErrorCase, Result } from 'nhs-notify-backend-client';

jest.mock('@utils/amplify-utils');
jest.mock('@utils/server-features');

const mockGetSessionServer = jest.mocked(getSessionServer);
const mockFetchClient = jest.mocked(fetchClient);

const createRequest = (internalHeader = true): NextRequest =>
  ({
    headers: {
      get: (key: string) => {
        if (key === 'x-internal-request')
          return internalHeader ? 'true' : undefined;
      },
    },
  }) as NextRequest;

describe('features route', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockGetSessionServer.mockResolvedValueOnce({ accessToken: 'token' });

    jest.spyOn(NextResponse, 'json').mockImplementation(
      (data) =>
        ({
          status: 200,
          ok: true,
          json: () => Promise.resolve(data),
        }) as NextResponse
    );
  });

  it('returns 403 status if x-internal-request header is missing', async () => {
    const req = createRequest(false);
    const res = await getFeatures(req);

    expect(res.status).toBe(403);
  });

  it('returns initialFeatureFlags if no access token', async () => {
    mockGetSessionServer.mockReset();
    mockGetSessionServer.mockResolvedValueOnce({});

    const req = createRequest();
    const res = await getFeatures(req);
    const json = await res.json();

    expect(json).toEqual(initialFeatureFlags);
  });

  it('returns initialFeatureFlags on a fetchClient error', async () => {
    mockFetchClient.mockResolvedValueOnce({
      error: { errorMeta: { code: ErrorCase.INTERNAL, description: 'error' } },
    });

    const req = createRequest();
    const res = await getFeatures(req);
    const json = await res.json();

    expect(json).toEqual(initialFeatureFlags);
  });

  it('returns expected feature flags', async () => {
    const allFeaturesEnabled = Object.fromEntries(
      FEATURES.map((featureKey) => [featureKey, true])
    );

    mockFetchClient.mockResolvedValueOnce({
      data: { features: allFeaturesEnabled },
    });

    const req = createRequest();
    const res = await getFeatures(req);
    const json = await res.json();

    expect(json).toEqual(allFeaturesEnabled);
  });

  it('defaults to false for missing feature flags', async () => {
    mockFetchClient.mockResolvedValueOnce({
      data: { features: { proofing: true } },
    });

    const req = createRequest();
    const res = await getFeatures(req);
    const json = await res.json();

    expect(json).toEqual({
      proofing: true,
      routing: false,
    });
  });

  it('returns initialFeatureFlags if fetchClient returns undefined', async () => {
    mockFetchClient.mockResolvedValueOnce({} as Result<null>);

    const req = createRequest();
    const res = await getFeatures(req);
    const json = await res.json();

    expect(json).toEqual(initialFeatureFlags);
  });
});
