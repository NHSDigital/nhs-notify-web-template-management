import { CreateEmailTemplate } from '@forms/CreateEmailTemplate/CreateEmailTemplate';
import { PageProps, TemplateType } from '@utils/types';
import { getSession } from '@utils/form-actions';
import { redirect, RedirectType } from 'next/navigation';

const CreateEmailTemplatePage = async ({
  params: { sessionId },
}: PageProps) => {
  const session = await getSession(sessionId);

  if (!session || session.templateType !== TemplateType.EMAIL) {
    return redirect('/invalid-session', RedirectType.replace);
  }

  return <CreateEmailTemplate initialState={session} />;
};

export default CreateEmailTemplatePage;
