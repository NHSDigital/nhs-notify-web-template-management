import type { HTMLProps, PropsWithChildren } from 'react';
import classNames from 'classnames';
import styles from './MessagePlanConditionalTemplatesList.module.scss';

export function MessagePlanConditionalTemplatesList({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLProps<HTMLUListElement>>) {
  return (
    <ul
      className={classNames(
        styles['message-plan-conditional-templates'],
        className
      )}
      {...props}
    >
      {children}
    </ul>
  );
}

export function MessagePlanConditionalTemplatesListItem({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLProps<HTMLLIElement>>) {
  return (
    <li
      className={classNames(
        styles['message-plan-conditional-templates__list-item'],
        className
      )}
      {...props}
    >
      {children}
    </li>
  );
}
