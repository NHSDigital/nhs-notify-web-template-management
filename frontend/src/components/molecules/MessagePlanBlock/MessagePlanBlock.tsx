import classNames from 'classnames';
import { TemplateDto } from 'nhs-notify-backend-client';
import { MessagePlanChannelTemplate } from '@molecules/MessagePlanChannelTemplate/MessagePlanChannelTemplate';

import styles from '@molecules/MessagePlanBlock/MessagePlanBlock.module.scss';

export function MessagePlanBlock({
  number,
  title,
  template,
  children,
}: {
  number: number;
  title: string;
  template: TemplateDto;
  children?: React.ReactNode;
}) {
  return (
    <li
      className={classNames(
        styles['message-plan-block'],
        'notify-channel-block'
      )}
    >
      <div className='notify-channel-block-channel'>
        <div className={styles['message-plan-block-number']} aria-hidden='true'>
          {number}
        </div>
        <h2 className='nhsuk-heading-m nhsuk-u-padding-top-1'>{title}</h2>
      </div>

      <MessagePlanChannelTemplate template={template} />

      {children && (
        <ul className={styles['channel-list-nested']}>{children}</ul>
      )}
    </li>
  );
}
