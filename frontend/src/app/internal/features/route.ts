'use server';

import { NextResponse, NextRequest } from 'next/server';
import { getSessionServer } from '@utils/amplify-utils';
import {
  clientConfigurationApiClient,
  ClientFeatures,
} from 'nhs-notify-backend-client';
import { initialFeatureFlags } from '@providers/features-provider';

export async function GET(request: NextRequest) {
  const internalHeader = request.headers.get('x-internal-request');

  if (internalHeader !== 'true') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const session = await getSessionServer();
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json(initialFeatureFlags, { status: 401 });
  }

  const result = await clientConfigurationApiClient.fetch(token);

  if (result.error) {
    return NextResponse.json(initialFeatureFlags, { status: 500 });
  }

  const features: ClientFeatures = {
    routing: result.data?.features.routing ?? false,
    proofing: result.data?.features.proofing ?? false,
  };

  return NextResponse.json(features);
}
