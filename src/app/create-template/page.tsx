'use server';

import { redirect, RedirectType } from 'next/navigation';
import { SessionService } from '../../domain/session/session-service';
import { Session } from '@domain/session/session';

const CreateTemplate = async () => {
  const sessionService = SessionService.init();

  const session = await sessionService.beginSession();

  session.validate();

  redirect(`/choose-a-template-type/${session.id}`, RedirectType.replace);
};

export default CreateTemplate;
