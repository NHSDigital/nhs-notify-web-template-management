'use client';

import { ConfirmCancelProps } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { getBasePath } from '@utils/get-base-path';
import { useActionState } from 'react';
import { requestProof } from './server-action';

export function RequestProof({
  templateName,
  templateId,
  goBackPath,
  confirmPath,
}: ConfirmCancelProps) {
  const {
    buttons,
    checkTestData,
    requirementsIntro,
    requirementsList,
    subHeading,
    waitTime,
  } = content.components.requestProof;

  const goBackHref = `${getBasePath()}/${goBackPath}/${templateId}`;

  const [_, action] = useActionState(requestProof, confirmPath);

  return (
    <NHSNotifyMain>
      <div className='nhsuk-grid-row'>
        <div className='nhsuk-grid-column-two-thirds'>
          <h1 id='request-proof'>
            Request a proof of &apos;{templateName}&apos;
          </h1>
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
