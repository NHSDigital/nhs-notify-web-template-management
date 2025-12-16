import { ErrorSummary, HintText } from 'nhsuk-react-components';
import { ErrorState } from 'nhs-notify-web-template-management-utils';
import { FC, HTMLProps, JSX, useEffect, useRef } from 'react';
import content, {
  templateMessageContainsInvalidPersonalisationErrorText,
} from '@content/content';
import { INVALID_PERSONALISATION_FIELDS } from '@utils/constants';
import { ErrorCodes } from '@utils/error-codes';

const UnlinkedErrorSummaryItem: FC<HTMLProps<HTMLSpanElement>> = (props) => (
  <li>
    <span className='nhsuk-error-message' {...props} />
  </li>
);

const errorComponents: Record<string, JSX.Element> = {
  [ErrorCodes.MESSAGE_CONTAINS_INVALID_PERSONALISATION_FIELD_NAME]: (
    <>
      {templateMessageContainsInvalidPersonalisationErrorText}
      <ul className='nhsuk-list nhsuk-list--bullet'>
        {INVALID_PERSONALISATION_FIELDS.map((item) => (
          <li key={`personalisation-field-${item.slice(0, 5)}`}>{item}</li>
        ))}
      </ul>
    </>
  ),
};

const renderError = (error: string) => {
  return errorComponents[error] || error;
};

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

  const renderedFieldErrors =
    fieldErrors &&
    Object.entries(fieldErrors).map(([id, errors]) =>
      errors.map((error) => (
        <ErrorSummary.Item
          href={`#${id}`}
          key={`field-error-summary-${id}-${error.slice(0, 5)}`}
        >
          {renderError(error)}
        </ErrorSummary.Item>
      ))
    );

  return (
    <ErrorSummary ref={errorSummaryRef}>
      <ErrorSummary.Title data-testid='error-summary'>
        {content.components.errorSummary.heading}
      </ErrorSummary.Title>
      {hint && <HintText>{hint}</HintText>}
      <ErrorSummary.List>
        {renderedFieldErrors}
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
