import { ErrorSummary, HintText } from 'nhsuk-react-components';
import { ErrorState } from 'nhs-notify-web-template-management-utils';
import { FC, HTMLProps, useEffect, useRef } from 'react';
import content from '@content/content';

const UnlinkedErrorSummaryItem: FC<HTMLProps<HTMLSpanElement>> = (props) => (
  <li>
    <span className='nhsuk-error-message' {...props} />
  </li>
);

export type NhsNotifyErrorSummaryProps = {
  hint?: string;
  errorState?: ErrorState;
};

export const NhsNotifyErrorSummary = ({
  hint,
  errorState,
}: NhsNotifyErrorSummaryProps) => {
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errorState && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
      errorSummaryRef.current.scrollIntoView();
    }
  }, [errorState]);

  if (!errorState) {
    return;
  }

  const { fieldErrors, formErrors } = errorState;

  return (
    <ErrorSummary ref={errorSummaryRef}>
      <ErrorSummary.Title data-testid='error-summary'>
        {content.components.errorSummary.heading}
      </ErrorSummary.Title>
      {hint && <HintText>{hint}</HintText>}
      <ErrorSummary.List>
        {fieldErrors &&
          Object.entries(fieldErrors).map(([id, errors]) => (
            <ErrorSummary.Item
              href={`#${id}`}
              key={`field-error-summary-${id}`}
            >
              {errors.join(', ')}
            </ErrorSummary.Item>
          ))}
        {formErrors &&
          formErrors.map((error, id) => (
            <UnlinkedErrorSummaryItem key={`form-error-summary-${id}`}>
              {error}
            </UnlinkedErrorSummaryItem>
          ))}
      </ErrorSummary.List>
    </ErrorSummary>
  );
};
