import Link from 'next/link';
import { Channel, RoutingConfig, TemplateDto } from 'nhs-notify-backend-client';
import {
  channelDisplayMappings,
  channelToTemplateType,
  messagePlanChooseTemplateUrl,
  RoutingAccessibleFormatLetterType,
} from 'nhs-notify-web-template-management-utils';
import classNames from 'classnames';
import { removeTemplateFromMessagePlan } from '@app/message-plans/choose-templates/[routingConfigId]/actions';
import { interpolate } from '@utils/interpolate';

import styles from '@molecules/MessagePlanChannelTemplate/MessagePlanChannelTemplate.module.scss';

import copy from '@content/content';
const { messagePlanChannelTemplate: content } = copy.components;

function MessagePlanChannelTemplateBase({
  channelTemplateType,
  required,
  templates,
  routingConfigId,
  chooseTemplateUrl,
  lockNumber,
  removeTemplateAction,
  testIdSuffix,
  multipleTemplates = false,
}: {
  channelTemplateType: string;
  required: boolean;
  templates: TemplateDto[];
  routingConfigId: string;
  chooseTemplateUrl: string;
  lockNumber: number;
  removeTemplateAction: (formData: FormData) => Promise<void>;
  testIdSuffix: string;
  multipleTemplates?: boolean;
}) {
  const templateCount = templates.length;
  const hasTemplates = templateCount > 0;

  return (
    <div
      className={styles['channel-template-outer']}
      data-testid={`channel-template-${testIdSuffix}`}
    >
      <div className={styles['channel-template-inner']}>
        <h3 className='nhsuk-heading-s'>{`${channelTemplateType}${required ? '' : ' (optional)'}`}</h3>

        {hasTemplates && (
          <div data-testid='template-names' className='nhsuk-u-margin-bottom-2'>
            {templates.map((template) => (
              <p
                key={template.id}
                className='nhsuk-u-margin-bottom-1'
                data-testid={`template-name-${testIdSuffix}`}
              >
                {template.name}
              </p>
            ))}
          </div>
        )}

        <ul className={styles['channel-template-actions']}>
          {!hasTemplates && (
            <li>
              <Link
                data-testid={`choose-template-link-${testIdSuffix}`}
                className='nhsuk-link nhsuk-link--no-visited-state'
                href={chooseTemplateUrl}
              >
                {content.templateLinks.choose}
                <span className='nhsuk-u-visually-hidden'>
                  {channelTemplateType}
                </span>{' '}
                {interpolate(content.templateLinks.templateWord, {
                  templateCount: multipleTemplates ? 2 : 1,
                })}
              </Link>
            </li>
          )}

          {hasTemplates && (
            <>
              <li>
                <Link
                  data-testid={`change-template-link-${testIdSuffix}`}
                  className='nhsuk-link nhsuk-link--no-visited-state'
                  href={chooseTemplateUrl}
                >
                  {content.templateLinks.change}
                  <span className='nhsuk-u-visually-hidden'>
                    {channelTemplateType}
                  </span>{' '}
                  {interpolate(content.templateLinks.templateWord, {
                    templateCount,
                  })}
                </Link>
              </li>

              <li>
                <form>
                  <input
                    type='hidden'
                    name='routingConfigId'
                    value={routingConfigId}
                    readOnly
                  />
                  <input
                    type='hidden'
                    name='lockNumber'
                    value={lockNumber}
                    readOnly
                  />
                  {templates.map((template) => (
                    <input
                      key={template.id}
                      type='hidden'
                      name='templateId'
                      value={template.id}
                      readOnly
                    />
                  ))}
                  <button
                    data-testid={`remove-template-link-${testIdSuffix}`}
                    className={classNames(
                      styles['channel-template-link--remove'],
                      'nhsuk-link'
                    )}
                    formAction={removeTemplateAction}
                    type='submit'
                  >
                    {interpolate(content.templateLinks.remove, {
                      templateCount,
                    })}
                    <span className='nhsuk-u-visually-hidden'>
                      {channelTemplateType}
                    </span>{' '}
                    {interpolate(content.templateLinks.templateWord, {
                      templateCount,
                    })}
                  </button>
                </form>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export function MessagePlanChannelTemplate({
  channel,
  template,
  routingConfigId,
  lockNumber,
  required = true,
}: {
  channel: Channel;
  routingConfigId: RoutingConfig['id'];
  lockNumber: number;
  template?: TemplateDto;
  required?: boolean;
}) {
  const chooseTemplateUrl = `/message-plans/${messagePlanChooseTemplateUrl(channelToTemplateType(channel))}/${routingConfigId}?lockNumber=${lockNumber}`;

  return (
    <MessagePlanChannelTemplateBase
      channelTemplateType={channelDisplayMappings(channel)}
      required={required}
      templates={template ? [template] : []}
      routingConfigId={routingConfigId}
      lockNumber={lockNumber}
      chooseTemplateUrl={chooseTemplateUrl}
      removeTemplateAction={removeTemplateFromMessagePlan}
      testIdSuffix={channel}
    />
  );
}

export function MessagePlanAccessibleFormatTemplate({
  accessibleFormat,
  template,
  lockNumber,
  routingConfigId,
}: {
  accessibleFormat: RoutingAccessibleFormatLetterType;
  template?: TemplateDto;
  lockNumber: number;
  routingConfigId: string;
}) {
  const chooseTemplateUrl = `/message-plans/${messagePlanChooseTemplateUrl('LETTER', accessibleFormat)}/${routingConfigId}?lockNumber=${lockNumber}`;

  return (
    <MessagePlanChannelTemplateBase
      channelTemplateType={
        content.messagePlanConditionalLetterTemplates.accessibleFormats[
          accessibleFormat
        ]
      }
      required={false}
      templates={template ? [template] : []}
      routingConfigId={routingConfigId}
      chooseTemplateUrl={chooseTemplateUrl}
      lockNumber={lockNumber}
      removeTemplateAction={removeTemplateFromMessagePlan}
      testIdSuffix={accessibleFormat}
    />
  );
}

export function MessagePlanLanguageTemplate({
  selectedTemplates,
  routingConfigId,
  lockNumber,
}: {
  selectedTemplates: TemplateDto[];
  routingConfigId: string;
  lockNumber: number;
}) {
  const chooseTemplateUrl = `/message-plans/${messagePlanChooseTemplateUrl('LETTER', 'language')}/${routingConfigId}?lockNumber=${lockNumber}`;

  return (
    <MessagePlanChannelTemplateBase
      channelTemplateType={
        content.messagePlanConditionalLetterTemplates.languageFormats
      }
      required={false}
      templates={selectedTemplates}
      routingConfigId={routingConfigId}
      lockNumber={lockNumber}
      chooseTemplateUrl={chooseTemplateUrl}
      removeTemplateAction={removeTemplateFromMessagePlan}
      testIdSuffix='foreign-language'
      multipleTemplates={true}
    />
  );
}
