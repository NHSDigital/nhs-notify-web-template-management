'use client';

import { NHSNotifyButton } from '@atoms/NHSNotifyButton/NHSNotifyButton';
import * as NHSNotifyForm from '@atoms/NHSNotifyForm';
import content from '@content/content';
import { useTextInput } from '@hooks/use-text-input.hook';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { NHSNotifyFormWrapper } from '@molecules/NHSNotifyFormWrapper/NHSNotifyFormWrapper';
import { useNHSNotifyForm } from '@providers/form-provider';
import classNames from 'classnames';
import Link from 'next/link';
import type { RoutingConfig } from 'nhs-notify-web-template-management-types';
import {
  Details,
  HintText,
  Label,
  TextInput,
  WarningCallout,
} from 'nhsuk-react-components';
import { PropsWithChildren } from 'react';

const formContent = content.components.messagePlanForm;

export function MessagePlanForm({
  backLink,
  campaignIds,
  children,
  initialState = { campaignId: '', name: '' },
}: PropsWithChildren<{
  campaignIds?: string[];
  backLink: { href: string; text: string };
  initialState?: Pick<RoutingConfig, 'campaignId' | 'name'>;
}>) {
  const [state, action] = useNHSNotifyForm();

  const [name, handleNameChange] = useTextInput<HTMLInputElement>(
    initialState.name
  );

  const nameError = state.errorState?.fieldErrors?.name?.join(',');

  return (
    <NHSNotifyFormWrapper formId='message-plan' action={action}>
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
      {campaignIds && (
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
            <NHSNotifyForm.FormGroup htmlFor='campaignId'>
              <Label htmlFor='campaignId' id='campaignId--label' size='s'>
                {formContent.fields.campaignId.label}
              </Label>
              <HintText id='campaignId--hint'>
                {formContent.fields.campaignId.hintMulti}
              </HintText>
              <WarningCallout
                className='nhsuk-u-margin-bottom-5 nhsuk-u-margin-top-5'
                data-testid='campaign-warning-callout'
              >
                <WarningCallout.Label>
                  {formContent.fields.campaignId.warningCallout.heading}
                </WarningCallout.Label>
                <p>{formContent.fields.campaignId.warningCallout.content}</p>
              </WarningCallout>
              <NHSNotifyForm.ErrorMessage
                htmlFor='campaignId'
                id='campaignId--error-message'
              />
              <NHSNotifyForm.Select
                id='campaignId'
                name='campaignId'
                data-testid='campaign-id-field'
                aria-describedby='campaignId--hint campaignId--error-message'
                aria-labelledby='campaignId--label'
              >
                <option />
                {campaignIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </NHSNotifyForm.Select>
            </NHSNotifyForm.FormGroup>
          )}
        </div>
      )}
      <div className='nhsuk-form-group'>
        <NHSNotifyButton data-testid='submit-button'>
          {formContent.submitButton}
        </NHSNotifyButton>
        <Link
          href={backLink.href}
          className={classNames(
            'nhsuk-u-font-size-19',
            'nhsuk-u-margin-left-3',
            'nhsuk-u-padding-top-3',
            'inline-block'
          )}
          data-testid='back-link-bottom'
        >
          {backLink.text}
        </Link>
      </div>
      {children}
    </NHSNotifyFormWrapper>
  );
}
