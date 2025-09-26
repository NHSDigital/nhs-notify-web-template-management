'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getSessionServer } from '@utils/amplify-utils';
import { fetchClient } from '@utils/server-features';
import { FEATURES, initialFeatureFlags } from '@utils/features';

export async function GET(request: NextRequest) {
  const internalHeader = request.headers.get('x-internal-request');

  if (internalHeader !== 'true') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const session = await getSessionServer();

  if (!session?.accessToken) {
    return NextResponse.json(initialFeatureFlags);
  }

  const result = await fetchClient(session.accessToken);

  if (!result || result.error || !result.data?.features) {
    return NextResponse.json(initialFeatureFlags);
  }

  const features = Object.fromEntries(
    FEATURES.map((key) => [key, result.data?.features?.[key] ?? false])
  );

  return NextResponse.json(features);
}
