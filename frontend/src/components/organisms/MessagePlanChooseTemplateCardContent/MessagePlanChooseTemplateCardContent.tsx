import classNames from 'classnames';
import Link from 'next/link';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import copy from '@content/content';
import { interpolate } from '@utils/interpolate';
import styles from './MessagePlanChooseTemplateCardContent.module.scss';

const { messagePlanChannelTemplate: content } = copy.components;

export function MessagePlanChooseTemplateCardContent({
  channelTemplateType,
  templates,
  routingConfigId,
  chooseTemplateUrl,
  lockNumber,
  removeTemplateAction,
  testIdSuffix,
  multipleTemplates = false,
}: {
  channelTemplateType: string;
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
    <>
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
        {hasTemplates ? (
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
        ) : (
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
      </ul>
    </>
  );
}
