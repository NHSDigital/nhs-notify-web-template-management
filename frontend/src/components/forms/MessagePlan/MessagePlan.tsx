'use client';

import classNames from 'classnames';
import Link from 'next/link';
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
import content from '@content/content';
import { useNHSNotifyForm } from '@providers/form-provider';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';

const formContent = content.components.messagePlanForm;

export function MessagePlanForm({
  messageOrder,
  campaignIds,
}: {
  messageOrder: MessageOrder;
  campaignIds: string[];
}) {
  const [state, action] = useNHSNotifyForm();

  const [name, handleNameChange] = useTextInput<HTMLInputElement>('');
  const [campaignId, handleCampaignIdChange] =
    useTextInput<HTMLSelectElement>('');

  const nameError = state.errorState?.fieldErrors?.name?.join(',');
  const campaignIdError = state.errorState?.fieldErrors?.campaignId?.join(',');

  return (
    <NHSNotifyFormWrapper formId='message-plan' action={action}>
      <input type='hidden' name='messageOrder' value={messageOrder} readOnly />
      <div
        className={classNames(
          'nhsuk-form-group',
          'nhsuk-u-margin-bottom-6',
          nameError && 'nhsuk-form-group--error'
        )}
      >
        <Label htmlFor='name' size='s'>
          {formContent.fields.name.label}
        </Label>
        <HintText>{formContent.fields.name.hint}</HintText>
        <Details className='nhsuk-u-margin-top-3'>
          <Details.Summary>
            {formContent.fields.name.details.summary}
          </Details.Summary>
          <Details.Text>
            <ContentRenderer content={formContent.fields.name.details.text} />
          </Details.Text>
        </Details>
        <TextInput
          id='name'
          name='name'
          value={name}
          onChange={handleNameChange}
          error={nameError}
          data-testid='name-field'
        />
      </div>
      <div className='nhsuk-form-group nhsuk-u-margin-bottom-6'>
        {campaignIds.length === 1 ? (
          <>
            <Label htmlFor='campaignId' size='s'>
              {formContent.fields.campaignId.label}
            </Label>
            <HintText>{formContent.fields.campaignId.hintSingle}</HintText>
            <input
              type='hidden'
              name='campaignId'
              value={campaignIds[0]}
              readOnly
            />
            <p data-testid='single-campaign-id'>{campaignIds[0]}</p>
          </>
        ) : (
          <Select
            id='campaignId'
            name='campaignId'
            label={formContent.fields.campaignId.label}
            labelProps={{ size: 's' }}
            hint={formContent.fields.campaignId.hintMulti}
            defaultValue={campaignId}
            onChange={handleCampaignIdChange}
            error={campaignIdError}
            data-testid='campaign-id-field'
          >
            <Select.Option />
            {campaignIds.map((id) => (
              <Select.Option key={id} value={id}>
                {id}
              </Select.Option>
            ))}
          </Select>
        )}
      </div>
      <div className='nhsuk-form-group'>
        <NHSNotifyButton data-testid='submit-button'>
          {formContent.submitButton}
        </NHSNotifyButton>
        <Link
          href={formContent.backLink.href}
          className={classNames(
            'nhsuk-u-font-size-19',
            'nhsuk-u-margin-left-3',
            'nhsuk-u-padding-top-3',
            'inline-block'
          )}
          data-testid='go-back-link'
        >
          {formContent.backLink.text}
        </Link>
      </div>
    </NHSNotifyFormWrapper>
  );
}
