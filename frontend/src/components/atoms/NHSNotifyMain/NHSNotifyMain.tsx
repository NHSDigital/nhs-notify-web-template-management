import React from 'react';

export function NHSNotifyMain({ children }: { children: React.ReactNode }) {
  return (
    <main className='nhsuk-main-wrapper' id='maincontent' role='main'>
      {children}
    </main>
  );
}
