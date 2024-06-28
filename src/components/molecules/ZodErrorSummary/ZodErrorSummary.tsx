import { ErrorSummary } from 'nhsuk-react-components';
import { FormState } from '../../../utils/types';

export type ZodErrorSummaryProps = {
  errorHeading: string;
  state: FormState;
};

export const ZodErrorSummary = ({
  errorHeading,
  state,
}: ZodErrorSummaryProps) => {
  const hasError =
    state.formErrors.length > 0 || Object.keys(state.fieldErrors).length > 0;

  if (!hasError) {
    return <></>;
  }

  return (
    <ErrorSummary>
      <ErrorSummary.Title data-testid='error-summary'>
        {errorHeading}
      </ErrorSummary.Title>
      <ErrorSummary.List>
        {Object.entries(state.fieldErrors).map(([id, errors]) => (
          <ErrorSummary.Item href={`#${id}`} key={`field-error-summary-${id}`}>
            {errors.join(', ')}
          </ErrorSummary.Item>
        ))}
        {Object.values(state.formErrors).map((error, id) => (
          <ErrorSummary.Item key={`form-error-summary-${id}`}>
            {error}
          </ErrorSummary.Item>
        ))}
      </ErrorSummary.List>
    </ErrorSummary>
  );
};
