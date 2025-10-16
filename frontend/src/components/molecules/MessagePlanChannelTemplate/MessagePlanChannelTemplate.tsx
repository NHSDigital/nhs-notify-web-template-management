import Link from 'next/link';
import { Channel, RoutingConfig, TemplateDto } from 'nhs-notify-backend-client';
import {
  channelDisplayMappings,
  channelToTemplateType,
  messagePlanChooseTemplateUrl,
} from 'nhs-notify-web-template-management-utils';
import classNames from 'classnames';

import styles from '@molecules/MessagePlanChannelTemplate/MessagePlanChannelTemplate.module.scss';

import copy from '@content/content';
const { messagePlanChannelTemplate: content } = copy.components;

export function MessagePlanChannelTemplate({
  channel,
  template,
  routingConfigId,
  required = true,
}: {
  channel: Channel;
  routingConfigId: RoutingConfig['id'];
  template?: TemplateDto;
  required?: boolean;
}) {
  const channelDisplayText =
    channelDisplayMappings(channel) + (required ? '' : ` ${content.optional}`);

  return (
    <div className={styles['channel-template-outer']}>
      <div className={styles['channel-template-inner']}>
        <h3 className='nhsuk-heading-s'>{channelDisplayText}</h3>

        {template && template.id && (
          <p
            className='nhsuk-u-margin-bottom-2'
            data-testid={`template-name-${channel}`}
          >
            {template.name}
          </p>
        )}

        <ul className={styles['channel-template-actions']}>
          {!template && (
            <li>
              <Link
                data-testid={`choose-template-link-${channel}`}
                className='nhsuk-link nhsuk-link--no-visited-state'
                href={`/message-plans/${messagePlanChooseTemplateUrl(channelToTemplateType(channel))}/${routingConfigId}`}
              >
                {content.templateLinks.choose}
                <span className='nhsuk-u-visually-hidden'>
                  {channelDisplayText}
                </span>{' '}
                {content.templateLinks.template}
              </Link>
            </li>
          )}

          {template && template.id && (
            <>
              <li>
                <Link
                  data-testid={`change-template-link-${channel}`}
                  className='nhsuk-link nhsuk-link--no-visited-state'
                  href={`/message-plans/${messagePlanChooseTemplateUrl(channelToTemplateType(channel))}/${routingConfigId}`}
                >
                  {content.templateLinks.change}
                  <span className='nhsuk-u-visually-hidden'>
                    {channelDisplayText}
                  </span>{' '}
                  {content.templateLinks.template}
                </Link>
              </li>
              <li>
                <button
                  data-testid={`remove-template-link-${channel}`}
                  className={classNames(
                    styles['channel-template-link--remove'],
                    'nhsuk-link'
                  )}
                  type='button'
                >
                  {content.templateLinks.remove}
                  <span className='nhsuk-u-visually-hidden'>
                    {channelDisplayText}
                  </span>{' '}
                  {content.templateLinks.template}
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
