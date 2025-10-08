import Link from 'next/link';
import { Channel, TemplateDto } from 'nhs-notify-backend-client';
import { channelDisplayMappings } from 'nhs-notify-web-template-management-utils';
import classNames from 'classnames';

import styles from '@molecules/MessagePlanChannelTemplate/MessagePlanChannelTemplate.module.scss';

import copy from '@content/content';
const { messagePlanChannelTemplate: content } = copy.components;

export function MessagePlanChannelTemplate({
  channel,
  template,
  required = true,
}: {
  channel: Channel;
  template?: TemplateDto;
  required?: boolean;
}) {
  const channelDisplayText =
    channelDisplayMappings(channel) + (required ? '' : ` ${content.optional}`);

  return (
    <div className={styles['channel-template-outer']}>
      <div className={styles['channel-template-inner']}>
        <h3 className='nhsuk-heading-s'>{channelDisplayText}</h3>

        {!template && (
          <Link
            className='nhsuk-link nhsuk-link--no-visited-state'
            href={content.templateLinks.choose.href}
          >
            {content.templateLinks.choose.text}
            <span className='nhsuk-u-visually-hidden'>
              {channelDisplayText}
            </span>{' '}
            {content.templateLinks.template}
          </Link>
        )}

        {template && template.id && (
          <>
            <p>
              {template.name}
              <br />
              <Link
                className='nhsuk-link nhsuk-link--no-visited-state'
                href={content.templateLinks.change.href}
              >
                {content.templateLinks.change.text}
                <span className='nhsuk-u-visually-hidden'>
                  {channelDisplayText}
                </span>{' '}
                {content.templateLinks.template}
              </Link>
            </p>
            <p>
              <Link
                href={content.templateLinks.remove.href}
                className={classNames(
                  styles['channel-template-link--remove'],
                  'nhsuk-link'
                )}
              >
                {content.templateLinks.remove.text}
                <span className='nhsuk-u-visually-hidden'>
                  {channelDisplayText}
                </span>{' '}
                {content.templateLinks.template}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
