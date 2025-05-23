import { ErrorSummary, ErrorMessage } from 'nhsuk-react-components';
import { FormState } from 'nhs-notify-web-template-management-utils';

export type ZodErrorSummaryProps = {
  errorHeading: string;
  state: FormState;
};

export const ZodErrorSummary = ({
  errorHeading,
  state,
}: ZodErrorSummaryProps) => {
  const { validationError } = state;

  if (!validationError) {
    return;
  }

  const formErrors = Object.values(validationError.formErrors).map(
    (error, id) => ({
      id: `form-error-summary-${id}`,
      error,
    })
  );

  return (
    <ErrorSummary>
      <ErrorSummary.Title data-testid='error-summary'>
        {errorHeading}
      </ErrorSummary.Title>
      <ErrorSummary.List>
        {Object.entries(validationError.fieldErrors).map(([id, errors]) => (
          <ErrorSummary.Item href={`#${id}`} key={`field-error-summary-${id}`}>
            {errors.join(', ')}
          </ErrorSummary.Item>
        ))}
        {formErrors.map(({ error, id }) => (
          <ErrorMessage key={`form-error-summary-${id}`}>{error}</ErrorMessage>
        ))}
      </ErrorSummary.List>
    </ErrorSummary>
  );
};
