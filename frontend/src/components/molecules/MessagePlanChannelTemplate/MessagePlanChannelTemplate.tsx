import Link from 'next/link';
import { TemplateDto } from 'nhs-notify-backend-client';
import { templateTypeDisplayMappings } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';

import styles from '@molecules/MessagePlanChannelTemplate/MessagePlanChannelTemplate.module.scss';

const { messagePlanChannelTemplate } = content.components;

export function MessagePlanChannelTemplate({
  template: { templateType, name: templateName, id: templateId },
}: {
  template: TemplateDto;
}) {
  return (
    <div className={styles['message-plan-block-outer']}>
      <div className={styles['message-plan-block-inner']}>
        <h3 className='nhsuk-heading-s'>
          {templateTypeDisplayMappings(templateType)}
        </h3>

        {!templateId && (
          <Link href='#'>
            {messagePlanChannelTemplate.templateLinks.choose}
            <span className='nhsuk-u-visually-hidden'>
              {templateTypeDisplayMappings(templateType)}
            </span>
            {messagePlanChannelTemplate.templateLinks.template}
          </Link>
        )}

        {templateId && (
          <>
            <p>
              {templateName}
              <br />
              <Link href='#'>
                {messagePlanChannelTemplate.templateLinks.change}
                <span className='nhsuk-u-visually-hidden'>
                  {templateTypeDisplayMappings(templateType)}
                </span>
                {messagePlanChannelTemplate.templateLinks.template}
              </Link>
            </p>
            <p>
              <Link
                href='#'
                style={{ color: '#d5281b' }}
                className='nhsuk-link nhsuk-link--no-visited-state'
              >
                {messagePlanChannelTemplate.templateLinks.remove}
                <span className='nhsuk-u-visually-hidden'>
                  {templateTypeDisplayMappings(templateType)}
                </span>
                {messagePlanChannelTemplate.templateLinks.template}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
