import { CreateEmailTemplate } from '@forms/CreateEmailTemplate/CreateEmailTemplate';
import { PageProps } from '@utils/types';
import { getSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const CreateEmailTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);
  if (!session) {
    redirect('/invalid-session', RedirectType.replace);
  }

  return <CreateEmailTemplate initialState={session} />;
};

export default CreateEmailTemplatePage;
