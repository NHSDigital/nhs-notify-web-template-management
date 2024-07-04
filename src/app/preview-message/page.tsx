'use client';

import { useSearchParams } from 'next/navigation';
import { ReviewSMSTemplate } from '@/src/components/forms/ReviewSMSTemplate';
import { ReviewEmailTemplate } from '../../components/forms/ReviewEmailTemplate';
import { ReviewLetterTemplate } from '../../components/forms/ReviewLetterTemplate';
import { ReviewNHSAppTemplate } from '@/src/components/forms/ReviewNHSAppTemplate';
import { markdown } from '../../__tests__/components/forms/fixtures';

export default function Page() {
  const searchParams = useSearchParams();

  const params = searchParams.get('form');

  const sms = (
    <ReviewSMSTemplate templateName='template-1-sms' message={markdown} />
  );

  const email = (
    <ReviewEmailTemplate
      templateName='template-1-email'
      message={markdown}
      subject='This is the subject'
    />
  );

  const letter = (
    <ReviewLetterTemplate
      templateName='template-1-letter'
      heading='The main heading of the letter'
      bodyText={markdown}
    />
  );

  const nhsApp = (
    <ReviewNHSAppTemplate templateName='template-1-nhsApp' message={markdown} />
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
