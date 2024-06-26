'use client';

import { PreviewTextMessage } from '../../components/forms/PreviewTextMessage/PreviewTextMessage';
import { PreviewEmail } from '../../components/forms/PreviewEmail/PreviewEmail';
import { PreviewLetter } from '../../components/forms/PreviewLetter/PreviewLetter';
import { PreviewNHSApp } from '../../components/forms/PreviewNHSApp/PreviewNHSApp';

export default function Page(context: unknown) {
  const sms = (
    <PreviewTextMessage
      templateName='template-1-sms'
      message='This is the message we doing to send!!'
    />
  );

  const email = (
    <PreviewEmail
      templateName='template-1-email'
      message='This is the message we doing to send!!'
      subject='This is the subject'
    />
  );

  const letter = (
    <PreviewLetter
      templateName='template-1-letter'
      heading=' The main heading of the letter'
      bodyText='helloWorld!!!'
    />
  );

  const nhsApp = (
    <PreviewNHSApp
      templateName='template-1-nhsApp'
      message='This is the message we doing to send!!'
    />
  );

  return email;
}
