import { ErrorSummary, ErrorMessage } from 'nhsuk-react-components';
import { ErrorState } from 'nhs-notify-web-template-management-utils';
import { useEffect, useRef } from 'react';
import content from '@content/content';

export type NhsNotifyErrorSummaryProps = {
  state: { errorState?: ErrorState };
};

export const NhsNotifyErrorSummary = ({
  state: { errorState },
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

  const { fieldErrors, formErrors, multilineErrors } = errorState;

  return (
    <ErrorSummary ref={errorSummaryRef}>
      <ErrorSummary.Title data-testid='error-summary'>
        {content.components.errorSummary.heading}
      </ErrorSummary.Title>
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
            <ErrorMessage key={`form-error-summary-${id}`}>
              {error}
            </ErrorMessage>
          ))}
        {multilineErrors &&
          multilineErrors.map((errorLines, id) => (
            <ErrorMessage key={`error-summary-${id}`}>
              {errorLines.map((line, lineId) => (
                <p key={`error-line-${lineId}`}>{line}</p>
              ))}
            </ErrorMessage>
          ))}
      </ErrorSummary.List>
    </ErrorSummary>
  );
};
