'use client';

import { createContext, useContext } from 'react';

export const UserSubContext = createContext<string | undefined>(undefined);

export function useUserSub() {
  return useContext(UserSubContext);
}
