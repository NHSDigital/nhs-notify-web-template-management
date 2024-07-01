'use client';

import { useSearchParams } from 'next/navigation';
import {
  PreviewTextMessage,
  PreviewTextMessageActions,
} from '@forms/PreviewTextMessage';
import {
  PreviewEmail,
  PreviewEmailActions,
} from '../../components/forms/PreviewEmail';
import {
  PreviewLetter,
  PreviewLetterActions,
} from '../../components/forms/PreviewLetter';
import { PreviewNHSApp } from '@forms/PreviewNHSApp';
import { markdown } from '../../__tests__/components/forms/fixtures';

export default function Page(context: unknown) {
  const searchParams = useSearchParams();

  const params = searchParams.get('form');

  const sms = (
    <PreviewTextMessage
      templateName='template-1-sms'
      message={markdown}
      pageActions={new PreviewTextMessageActions()}
    />
  );

  const email = (
    <PreviewEmail
      pageActions={new PreviewEmailActions()}
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
      pageActions={new PreviewLetterActions()}
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
