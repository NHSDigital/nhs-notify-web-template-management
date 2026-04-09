import classNames from 'classnames';
import { ErrorMessage, HintText, Label } from 'nhsuk-react-components';
import React, { HTMLProps } from 'react';
import styles from './FileUpload.module.scss';
import { useNHSNotifyForm } from '@providers/form-provider';

interface FileUploadProps extends HTMLProps<HTMLDivElement> {
  id: string;
  error?: string;
  hint?: string;
}

export function FileUploadInput({
  className,
  id,
  ...props
}: Omit<HTMLProps<HTMLInputElement>, 'type'> & { id: string; name: string }) {
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

const FileUpload: React.FC<FileUploadProps> = ({
  error,
  hint,
  accept,
  label,
  id,
  ...rest
}) => {
  return (
    <div
      className={classNames('nhsuk-form-group', 'nhsuk-u-margin-bottom-0', {
        'nhsuk-form-group--error': error,
      })}
      {...rest}
    >
      {label && <Label htmlFor={id}>{label}</Label>}
      {hint && <HintText>{hint}</HintText>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <FileUploadInput
        id={id}
        name={id}
        accept={accept}
        data-testid={`file-selector-${id}`}
      />
    </div>
  );
};

export default FileUpload;
