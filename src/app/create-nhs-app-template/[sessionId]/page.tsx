'use server';

import { CreateNhsAppTemplate } from '@forms/CreateNhsAppTemplate/CreateNhsAppTemplate';
import { PageProps, TemplateType } from '@utils/types';
import { getSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const CreateNhsAppTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);

  if (!session || session.templateType !== TemplateType.NHS_APP) {
    redirect('/invalid-session', RedirectType.replace);
  }

  return <CreateNhsAppTemplate initialState={session} />;
};

export default CreateNhsAppTemplatePage;
