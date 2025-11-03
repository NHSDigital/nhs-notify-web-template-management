/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useActionState, useState } from 'react';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import content from '@content/content';
import {
  ErrorState,
  MESSAGE_ORDER_OPTIONS_LIST,
  MessageOrder,
} from 'nhs-notify-web-template-management-utils';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import { $ChooseMessageOrder, chooseMessageOrderAction } from './server-action';
import { validate } from '@utils/client-validate-form';

export const messageOrderDisplayMappings: Record<MessageOrder, string> = {
  NHSAPP: 'NHS App only',
  'NHSAPP,EMAIL': 'NHS App, Email',
  'NHSAPP,SMS': 'NHS App, Text message',
  'NHSAPP,EMAIL,SMS': 'NHS App, Email, Text message',
  'NHSAPP,SMS,EMAIL': 'NHS App, Text message, Email',
  'NHSAPP,SMS,LETTER': 'NHS App, Text message, Letter',
  'NHSAPP,EMAIL,SMS,LETTER': 'NHS App, Email, Text message, Letter',
  LETTER: 'Letter only',
};

export const ChooseMessageOrder = () => {
  const [state, action] = useActionState(chooseMessageOrderAction, {});
  const [errorState, setErrorState] = useState<ErrorState | undefined>(
    state.errorState
  );

  const formValidate = validate($ChooseMessageOrder, setErrorState);

  const options = MESSAGE_ORDER_OPTIONS_LIST.map((messageOrder) => ({
    id: messageOrder,
    text: messageOrderDisplayMappings[messageOrder],
  }));

  const { pageHeading, buttonText, hint, backLinkText } =
    content.components.chooseMessageOrder;

  return (
    <NHSNotifyMain>
      <NhsNotifyErrorSummary errorState={errorState} />
      <img src='broken' />
      <NHSNotifyRadioButtonForm
        formId='choose-message-order'
        radiosId='messageOrder'
        action={action}
        state={{ errorState }}
        pageHeading={pageHeading}
        options={options}
        buttonText={buttonText}
        hint={hint}
        formAttributes={{ onSubmit: formValidate }}
        backLink={{
          text: backLinkText,
          url: '/message-plans',
        }}
      />
    </NHSNotifyMain>
  );
};
