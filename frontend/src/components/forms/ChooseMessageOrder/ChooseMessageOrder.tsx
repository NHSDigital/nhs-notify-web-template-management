'use client';

import { useActionState, useState } from 'react';
import { NHSNotifyRadioButtonForm } from '@molecules/NHSNotifyRadioButtonForm/NHSNotifyRadioButtonForm';
import { NhsNotifyErrorSummary } from '@molecules/NhsNotifyErrorSummary/NhsNotifyErrorSummary';
import content from '@content/content';
import { ErrorState } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyMain } from '@atoms/NHSNotifyMain/NHSNotifyMain';
import {
  $ChooseMessageOrder,
  chooseMessageOrderAction,
  MessageOrder,
  MESSAGE_ORDER_OPTIONS_LIST,
} from './server-action';
import { validate } from '@utils/client-validate-form';

export const messageOrderDisplayMappings: Record<MessageOrder, string> = {
  NHS_APP: 'NHS App only',
  'NHS_APP,EMAIL': 'NHS App, Email',
  'NHS_APP,SMS': 'NHS App, Text message',
  'NHS_APP,EMAIL,SMS': 'NHS App, Email, Text message',
  'NHS_APP,SMS,EMAIL': 'NHS App, Text message, Email',
  'NHS_APP,SMS,LETTER': 'NHS App, Text message, Letter',
  'NHS_APP,EMAIL,SMS,LETTER': 'NHS App, Email, Text message, Letter',
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
