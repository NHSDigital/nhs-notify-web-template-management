'use client';

import { useActionState } from 'react';
import classNames from 'classnames';
import {
  Details,
  HintText,
  Label,
  Select,
  TextInput,
} from 'nhsuk-react-components';
import { MessageOrder } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import { useTextInput } from '@hooks/use-text-input.hook';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { useCampaignIds } from '@providers/client-config-provider';
import { getBasePath } from '@utils/get-base-path';
import { messagePlanServerAction } from './server-action';
import styles from './MessagePlan.module.scss';

export function MessagePlanForm({
  messageOrder,
}: {
  messageOrder: MessageOrder;
}) {
  const [state, action] = useActionState(messagePlanServerAction, {});

  const campaignIds = useCampaignIds();

  const [name, handleNameChange] = useTextInput<HTMLInputElement>('');
  const [campaignId, handleCampaignIdChange] =
    useTextInput<HTMLSelectElement>('');

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
        {campaignIds.length > 1 ? (
          <Select
            label='Campaign'
            labelProps={{ size: 's' }}
            hint='Choose which campaign this message plan is for'
            id='campaignId'
            defaultValue={campaignId}
            onChange={handleCampaignIdChange}
            error={state.errorState?.fieldErrors?.campaignId?.join(',')}
            data-testid='campaign-id-field'
          >
            <Select.Option />
            {campaignIds.map((id) => (
              <Select.Option key={id} value={id}>
                {id}
              </Select.Option>
            ))}
          </Select>
        ) : null}

        {campaignIds.length === 1 ? (
          <>
            <Label htmlFor='campaignId' size='s'>
              Campaign
            </Label>
            <HintText>You currently only have one campaign:</HintText>

            <input
              type='hidden'
              name='campaignId'
              value={campaignIds[0]}
              readOnly
            />
            <p>{campaignIds[0]}</p>
          </>
        ) : null}
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
