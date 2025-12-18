import React, { HTMLProps, JSX } from 'react';
import classNames from 'classnames';
import { Label, ErrorMessage } from 'nhsuk-react-components';

export type FormElementProps = {
  id: string;
  textAreaProps: HTMLProps<HTMLTextAreaElement>;
  label?: string;
  error?: string | JSX.Element;
  formGroupProps?: HTMLProps<HTMLDivElement>;
};

const NHSNotifyTextArea = (props: FormElementProps): JSX.Element => {
  const { id, label, error, textAreaProps } = props;
  const labelID = `${id}--label`;
  const errorID = `${id}--error-message`;

  return (
    <div
      className={classNames('nhsuk-form-group', {
        'nhsuk-form-group--error': error,
      })}
    >
      {label ? (
        <Label id={labelID} htmlFor={id} size='s'>
          {label}
        </Label>
      ) : null}
      {error ? <ErrorMessage id={errorID}>{error}</ErrorMessage> : null}
      <textarea
        className={classNames('nhsuk-textarea', {
          'nhsuk-textarea--error': error,
        })}
        aria-describedby={error ? errorID : undefined}
        id={id}
        name={id}
        {...textAreaProps}
      />
    </div>
  );
};

export default NHSNotifyTextArea;
