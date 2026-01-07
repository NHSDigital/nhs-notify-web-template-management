import { HTMLProps, PropsWithChildren } from 'react';
import classNames from 'classnames';
import styles from './MessagePlanConditionalTemplates.module.scss';

// TODO: CCM-12038 - atoms
export function MessagePlanCascadeConditionalTemplatesList({
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

export function MessagePlanCascadeConditionalTemplatesListItem({
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
