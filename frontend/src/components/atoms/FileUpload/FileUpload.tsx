import classNames from 'classnames';
import { ErrorMessage, HintText, Label } from 'nhsuk-react-components';
import React, { HTMLProps } from 'react';

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
      className={classNames('nhsuk-form-group', {
        'nhsuk-form-group--error': error,
      })}
      {...rest}
    >
      {label && <Label htmlFor={id}>{label}</Label>}
      {hint && <HintText>{hint}</HintText>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <input
        aria-describedby={id}
        id={id}
        name={id}
        className='file-upload'
        type='file'
        accept={accept}
      />
    </div>
  );
};

export default FileUpload;
