import classNames from 'classnames';
import { ErrorMessage, HintText, Label } from 'nhsuk-react-components';
import React, { HTMLProps } from 'react';
import styles from './FileUpload.module.scss';

interface FileUploadProps extends HTMLProps<HTMLDivElement> {
  error?: string;
  hint?: string;
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
      <input
        id={id}
        data-testid={`file-selector-${id}`}
        name={id}
        className={classNames(styles['file-upload'], 'nhsuk-input')}
        type='file'
        accept={accept}
      />
    </div>
  );
};

export default FileUpload;
