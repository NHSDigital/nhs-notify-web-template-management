'use client';

import path from 'path';
import { useSearchParams, redirect, RedirectType } from 'next/navigation';

export const Redirect = () => {
  const searchParams = useSearchParams();

  const requestDirectPath = searchParams.get('redirect');

  if (!requestDirectPath) {
    return redirect('/', RedirectType.push);
  }

  const redirectPath = path.normalize(`/redirect/${requestDirectPath}`);

  return redirect(redirectPath, RedirectType.push);
};
