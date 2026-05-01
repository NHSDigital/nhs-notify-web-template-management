import { useEffect, useRef } from 'react';
import type { MouseEventHandler } from 'react';
import { ErrorSummary, HintText } from 'nhsuk-react-components';
import content from '@content/content';
import {
  renderErrorSummaryItemFormError,
  renderErrorSummaryItemFieldError,
} from '@molecules/NhsNotifyErrorItem/NHSNotifyErrorItem';
import { ContentRenderer } from '@molecules/ContentRenderer/ContentRenderer';
import { addClassNameToContentBlock } from '@utils/add-classname-to-content-block';
import { ErrorState } from '@utils/types';

export type NhsNotifyErrorSummaryProps = {
  hint?: string;
  errorState?: ErrorState;
  onItemClick?: (fieldId: string) => MouseEventHandler<HTMLAnchorElement>;
};

export const NhsNotifyErrorSummary = ({
  hint,
  errorState = {},
  onItemClick,
}: NhsNotifyErrorSummaryProps) => {
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errorState && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
      errorSummaryRef.current.scrollIntoView();
    }
  }, [errorState]);

  const { fieldErrors, formErrors } = errorState;

  const showErrorSummary =
    (fieldErrors && Object.values(fieldErrors).some(Boolean)) ||
    (formErrors && formErrors.length > 0);

  if (!showErrorSummary) {
    return;
  }

  const renderedFieldErrors =
    fieldErrors &&
    Object.entries(fieldErrors).map(([id, errors]) =>
      errors.map((error) =>
        renderErrorSummaryItemFieldError(error, id, onItemClick)
      )
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
            <li key={`form-error-summary-${id}`}>
              {typeof error === 'string' ? (
                renderErrorSummaryItemFormError(error)
              ) : (
                <ContentRenderer
                  content={error.map((contentBlock) =>
                    addClassNameToContentBlock(
                      contentBlock,
                      'nhsuk-error-message'
                    )
                  )}
                />
              )}
            </li>
          ))}
      </ErrorSummary.List>
    </ErrorSummary>
  );
};
