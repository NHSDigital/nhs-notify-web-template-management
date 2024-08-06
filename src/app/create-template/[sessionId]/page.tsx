'use server';

import { getSession } from '@/src/utils/form-actions';
import { CreateTemplateSinglePage } from '@/src/components/molecules/CreateTemplateSinglePage/CreateTemplateSinglePage';
import { TemplateFormState } from '../../../utils/types';

type CreateTemplateProps = {
  params: {
    sessionId: string;
  };
};

const CreateTemplate = async ({
  params: { sessionId },
}: CreateTemplateProps) => {
  const session = await getSession(sessionId);

  const formState: TemplateFormState = {
    sessionId: session.id,
    ...session,
    templateType: session.templateType === 'UNKNOWN' ? '' : session.templateType,
    page: 'choose-template',
  };

  return <CreateTemplateSinglePage initialState={formState} />;
};

export default CreateTemplate;
