import React, { HTMLProps } from 'react';

interface CodeExampleProps extends HTMLProps<HTMLDivElement> {
  ariaText: string;
  ariaId: string;
  codeClassName?: string;
}

const CodeExample: React.FC<CodeExampleProps> = ({
  ariaText,
  ariaId,
  children,
  codeClassName,
}) => {
  return (
    <>
      <span id={ariaId} className='nhsuk-u-visually-hidden'>
        {ariaText}
      </span>
      <code aria-describedby={ariaId} className={codeClassName}>
        {children}
      </code>
    </>
  );
};

export default CodeExample;
