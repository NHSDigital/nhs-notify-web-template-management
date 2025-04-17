// 'use client';

import { ConfirmCancelProps } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import concatClassNames from '@utils/concat-class-names';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { getBasePath } from '@utils/get-base-path';
import { useActionState } from 'react';

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

  const [_, action] = useActionState(submitTemplate, confirmPath);

  return (
    <NHSNotifyMain>
      <h1
        id='request-proof'
        className={concatClassNames(
          'nhsuk-heading-l',
          'nhsuk-u-margin-bottom-0'
        )}
      >
        Request a proof of &apos;{templateName}&apos;
      </h1>
      <h2
        className={concatClassNames(
          'nhsuk-heading-xs',
          'nhsuk-u-margin-bottom-1'
        )}
      >
        {subHeading}
      </h2>
      <p>{requirementsIntro}</p>
      <ul>
        {requirementsList.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
      <p>{checkTestData}</p>
      <p>{waitTime}</p>
      <NHSNotifyFormWrapper formId='submit-template-form' action={action}>
        <input type='hidden' name='templateId' value={templateId} readOnly />
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
    </NHSNotifyMain>
  );
}
