'use client';

import { useSearchParams } from 'next/navigation';
import { PreviewTextMessage } from '@forms/PreviewTextMessage';
import { PreviewEmail } from '../../components/forms/PreviewEmail';
import { PreviewLetter } from '../../components/forms/PreviewLetter';
import { PreviewNHSApp } from '@forms/PreviewNHSApp';
import { markdown } from '../../__tests__/components/forms/fixtures';

export default function Page() {
  const searchParams = useSearchParams();

  const params = searchParams.get('form');

  const sms = (
    <PreviewTextMessage templateName='template-1-sms' message={markdown} />
  );

  const email = (
    <PreviewEmail
      templateName='template-1-email'
      message={markdown}
      subject='This is the subject'
    />
  );

  const letter = (
    <PreviewLetter
      templateName='template-1-letter'
      heading='The main heading of the letter'
      bodyText={markdown}
    />
  );

  const nhsApp = (
    <PreviewNHSApp templateName='template-1-nhsApp' message={markdown} />
  );

  switch (params) {
    case 'email':
      return email;
    case 'nhsapp':
      return nhsApp;
    case 'sms':
      return sms;
    default:
      return letter;
  }
}
