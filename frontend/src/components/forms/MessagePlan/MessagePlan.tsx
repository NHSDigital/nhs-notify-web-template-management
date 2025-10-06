'use client';

import { useActionState } from 'react';
import classNames from 'classnames';
import { Details, HintText, Label, TextInput } from 'nhsuk-react-components';
import { MessageOrder } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { useTextInput } from '@hooks/use-text-input.hook';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { getBasePath } from '@utils/get-base-path';
import { messagePlanServerAction } from './server-action';
import styles from './MessagePlan.module.scss';

export function MessagePlanForm({
  messageOrder,
}: {
  messageOrder: MessageOrder;
}) {
  const [state, action] = useActionState(messagePlanServerAction, {});

  const [name, handleNameChange] = useTextInput<HTMLInputElement>('');

  return (
    <NHSNotifyFormWrapper formId='message-plan' action={action}>
      <div className='nhsuk-form-group'>
        <input
          type='hidden'
          name='messageOrder'
          value={messageOrder}
          readOnly
        />
        <Label htmlFor='name' size='s'>
          Message plan name
        </Label>
        <HintText>This will not be visible to recipients.</HintText>
        <Details className='nhsuk-u-margin-top-3'>
          <Details.Summary>Naming your message plans</Details.Summary>
          <Details.Text>
            <p>
              You should name your message plans in a way that works best for
              your service or organisation.
            </p>
            <p>Common message plan names include the:</p>
            <ul className='nhsuk-list nhsuk-list--bullet'>
              <li>channels it uses</li>
              <li>subject or reason for the message</li>
              <li>intended audience for the message</li>
              <li>version number</li>
            </ul>
            <p>
              For example, &apos;Email, SMS, letter - covid19 2023 - over 65s -
              version 3&apos;
            </p>
          </Details.Text>
        </Details>
        <TextInput
          id='name'
          value={name}
          onChange={handleNameChange}
          error={state.errorState?.fieldErrors?.name?.join(',')}
          data-testid='name-field'
        />
      </div>
      <div className='nhsuk-form-group'>
        <NHSNotifyButton data-testid='submit-button'>
          Save and continue
        </NHSNotifyButton>
        <a
          href={`${getBasePath()}/message-plans/choose-message-order`}
          className={classNames(
            'nhsuk-u-font-size-19',
            'nhsuk-u-margin-left-3',
            'nhsuk-u-padding-top-3',
            styles.go_back
          )}
        >
          Go back
        </a>
      </div>
    </NHSNotifyFormWrapper>
  );
}
