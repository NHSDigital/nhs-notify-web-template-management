import type { HTMLProps, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { ORDINALS } from 'nhs-notify-web-template-management-utils';
import copy from '@content/content';
import { interpolate } from '@utils/interpolate';

import styles from './MessagePlanBlock.module.scss';

const { messagePlanBlock: content } = copy.components;

export function MessagePlanBlock({
  children,
  className,
  index,
  ...props
}: PropsWithChildren<HTMLProps<HTMLLIElement> & { index: number }>) {
  return (
    <>
      <li
        {...props}
        className={classNames(styles['message-plan-block'], className)}
      >
        <div className={styles['message-plan-block-number']} aria-hidden='true'>
          {index + 1}
        </div>
        <h2 className='nhsuk-heading-m nhsuk-u-padding-top-1'>
          {interpolate(content.title, { ordinal: ORDINALS[index] })}
        </h2>
        {children}
      </li>
    </>
  );
}
