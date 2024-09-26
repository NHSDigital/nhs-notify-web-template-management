'use server';

import { CreateSmsTemplate } from '@forms/CreateSmsTemplate/CreateSmsTemplate';
import { PageProps } from '@utils/types';
import { getSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const CreateSmsTemplatePage = async ({ params: { sessionId } }: PageProps) => {
  const session = await getSession(sessionId);

  if (!session) {
    return redirect('/invalid-session', RedirectType.replace);
  }

  return <CreateSmsTemplate initialState={session} />;
};

export default CreateSmsTemplatePage;
