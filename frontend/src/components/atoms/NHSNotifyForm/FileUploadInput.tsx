'use client';

import classNames from 'classnames';
import React, { HTMLProps } from 'react';
import styles from './FileUploadInput.module.scss';
import { useNHSNotifyForm } from '@providers/form-provider';

export function NHSNotifyFormFileUploadInput({
  className,
  id,
  ...props
}: Omit<HTMLProps<HTMLInputElement>, 'type'> & { id: string }) {
  const [state] = useNHSNotifyForm();

  const error = Boolean(state.errorState?.fieldErrors?.[id]?.length);

  return (
    <input
      className={classNames(
        styles['file-upload'],
        'nhsuk-input',
        { 'nhsuk-input--error': error },
        className
      )}
      id={id}
      type='file'
      {...props}
    />
  );
}
