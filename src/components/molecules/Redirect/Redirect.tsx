'use client';

import { getBasePath } from '@utils/get-base-path';
import { useSearchParams, redirect } from 'next/navigation';

export const Redirect = () => {
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get('redirect') ?? '/';

  redirect(redirectPath.replace(getBasePath(), ''));
};
