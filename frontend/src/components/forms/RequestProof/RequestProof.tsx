'use client';

import content from '@content/content';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { getBasePath } from '@utils/get-base-path';
import { useActionState } from 'react';
import { requestProof } from './server-action';
import { ActionPageProps } from 'nhs-notify-web-template-management-utils';

export function RequestProof({
  templateName,
  templateId,
  channel,
  lockNumber,
}: ActionPageProps) {
  const {
    buttons,
    checkTestData,
    heading,
    requirementsIntro,
    requirementsList,
    subHeading,
    waitTime,
  } = content.components.requestProof;

  const goBackHref = `${getBasePath()}/preview-letter-template/${templateId}`;

  const [_, action] = useActionState(requestProof, channel);

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1 id='request-proof'>{heading(templateName)}</h1>
          <h2 className='nhsuk-heading-m'>{subHeading}</h2>
          <p>{requirementsIntro}</p>
          <ul>
            {requirementsList.map((text, i) => (
              <li key={i}>{text}</li>
            ))}
          </ul>
          <p>{checkTestData}</p>
          <p>{waitTime}</p>
          <NHSNotifyFormWrapper formId='request-proof-form' action={action}>
            <input
              type='hidden'
              name='templateId'
              value={templateId}
              readOnly
            />
            <input
              type='hidden'
              name='lockNumber'
              value={lockNumber}
              readOnly
            />
            <NHSNotifyButton
              secondary
              id='go-back-button'
              className='nhsuk-u-margin-right-3'
              href={goBackHref}
            >
              {buttons.back}
            </NHSNotifyButton>
            <NHSNotifyButton id='request-proof-button'>
              {buttons.confirm}
            </NHSNotifyButton>
          </NHSNotifyFormWrapper>
        </div>
      </div>
    </NHSNotifyMain>
  );
}
