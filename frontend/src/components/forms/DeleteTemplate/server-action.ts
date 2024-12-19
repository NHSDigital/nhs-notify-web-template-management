import { redirect, RedirectType } from 'next/navigation';
import {
  ChannelTemplate,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { saveTemplate } from '@utils/form-actions';

// remove this when we stop using amplify backend, the API handles TTL logic
const calculateTTL = () => {
  const currentTimeSeconds = Math.floor(Date.now() / 1000);

  const maxSessionLengthInSeconds = Number.parseInt(
    process.env.MAX_SESSION_LENGTH_IN_SECONDS ?? '2592000',
    10
  ); // 30 days in seconds

  return currentTimeSeconds + maxSessionLengthInSeconds;
};

export const deleteTemplateAction = async (
  template: ChannelTemplate
): Promise<never> => {
  const ttl = calculateTTL();

  await saveTemplate(
    {
      ...template,
      templateStatus: TemplateStatus.DELETED,
    },
    ttl
  );

  redirect('/manage-templates', RedirectType.push);
};
